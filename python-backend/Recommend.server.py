from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from collections import Counter
import torch
import random

app = Flask(__name__)
model = SentenceTransformer("snunlp/KR-SBERT-V40K-klueNLI-augSTS")

# 중복 제거 함수
def set_book(book_list):
    see = set()
    result = []
    for book in book_list:
        isbn = book.get('isbn13')
        if isbn and isbn not in see:
            see.add(isbn)
            result.append(book)
    return result

@app.route('/hybrid-recommend', methods=['POST'])
def hybrid_recommend():
    try:
        data = request.get_json()
        genre_book_map = data.get("genreBookMap", {})
        saved_books = data.get("savedBooks", [])
        user_genres = data.get("genres", [])

        if not saved_books or not genre_book_map:
            return jsonify({"error": "Missing savedBooks or genreBookMap"}), 400

        book_Limit = 20

        # 관심 도서에서 카테고리 파트 추출
        cat_counter = Counter()
        for book in saved_books:
            parts = [p.strip() for p in book.get("categoryName", "").split('>') if p.strip()]
            if len(parts) >= 2:
                cat_counter[parts[1]] += 1

        top_categories = [cat for cat, _ in cat_counter.most_common(2)]
        other_categories = [cat for cat in cat_counter if cat not in top_categories]
        random.shuffle(other_categories)
        if other_categories:
            top_categories.append(other_categories[0])  # 2개 + 1개 무작위 추가

        #관심 장르에서 장르 키워드 분리 '/'
        grouped_genres = {}
        for genre_str in user_genres:
            keywords = set(part.strip() for part in genre_str.split("/"))
            grouped_genres[genre_str] = keywords

        genre_keywords = set(k for group in grouped_genres.values() for k in group)

        # 장르 기반 후보 풀 구성
        interest_pool = []
        genre_pool = []
        seen = set()

        for books in genre_book_map.values():
            for book in books:
                isbn = book.get("isbn13")
                if not isbn or isbn in seen:
                    continue

                category = book.get("categoryName", "")
                parts = [p.strip() for p in category.split('>') if p.strip()]
                if len(parts) >= 2 and parts[1] in top_categories:
                    interest_pool.append(book)
                    seen.add(isbn)

                if any(keyword in part for keyword in genre_keywords for part in parts):
                    genre_pool.append(book)

        print(f"✅ interest_pool: {len(interest_pool)}, genre_pool: {len(genre_pool)} ")

        # 관심 도서 기반 추천
        interest_results = []
        if interest_pool and len(saved_books) >= 2:
            pool_texts = [f"{b['categoryName']} {b['title']} {b['description'][:100]}" for b in interest_pool]
            pool_embeddings = model.encode(pool_texts, convert_to_tensor=True)

            query_texts = [f"{b['categoryName']} {b['title']} {b['description'][:100]}" for b in saved_books]
            query_embeddings = model.encode(query_texts, convert_to_tensor=True)

            # 클러스터 수 자동 결정
            X = query_embeddings.cpu().numpy()
            best_cluster_count = 1
            if len(saved_books) >= 3:
                scores = []
                for k in range(2, min(len(saved_books), 6)):
                    kmeans = KMeans(n_clusters=k, random_state=42).fit(X)
                    score = silhouette_score(X, kmeans.labels_)
                    scores.append((k, score))
                best_cluster_count = max(scores, key=lambda x: x[1])[0]
                print(f"📊 최적 클러스터 수: {best_cluster_count}")
            else:
                print("ℹ️ 클러스터 수 자동 설정 생략 (관심 도서 2권 이하)")

            # 클러스터링 및 대표 도서 추천
            kmeans = KMeans(n_clusters=best_cluster_count, random_state=42)
            labels = kmeans.fit_predict(X)

            seen_isbns = set()
            for cluster_id in range(best_cluster_count):
                cluster_indices = [i for i, lbl in enumerate(labels) if lbl == cluster_id]
                if not cluster_indices:
                    continue
                cluster_vecs = query_embeddings[cluster_indices]
                cluster_center = cluster_vecs.mean(dim=0, keepdim=True)
                sims = util.pytorch_cos_sim(cluster_center, pool_embeddings)[0]
                top_indices = torch.topk(sims, k = min(2,len(sims))).indices

                for idx in top_indices:
                    idx = int(idx.item())
                    book  = interest_pool[idx]
                    if book["isbn13"] in seen_isbns:
                        continue
                    score = float(sims[idx].item())
                    book["score"] = score
                    book["normalized_score"] = round(score, 2)
                    book["source"] = "interest"
                    interest_results.append(book)
                    seen_isbns.add(book["isbn13"])

            # 가중 평균 임베딩 계산
            weights = []
            vectors = []
            for book, emb in zip(saved_books, query_embeddings):
                parts = book.get("categoryName", "").split('>')
                key = parts[1].strip() if len(parts) >= 2 else ""
                w = cat_counter[key]
                weights.append(w)
                vectors.append(emb)

            weights = torch.tensor(weights, dtype=torch.float32).to(query_embeddings.device)
            user_embedding = torch.stack(vectors)
            weighted_vector = (user_embedding.T @ weights) / weights.sum()
            weighted_vector = weighted_vector.unsqueeze(0)

            # 보완 추천
            sims_to_all = util.pytorch_cos_sim(weighted_vector, pool_embeddings)[0]
            top_indices = torch.topk(sims_to_all, k=min(book_Limit, len(sims_to_all))).indices

            for idx_tensor in top_indices:
                idx = int(idx_tensor.item())
                book = interest_pool[idx]
                if book["isbn13"] not in {b["isbn13"] for b in interest_results}:
                    score = float(sims_to_all[idx].item())
                    book["score"] = score
                    book["normalized_score"] = round(score, 2)
                    book["source"] = "interest"
                    interest_results.append(book)
                if len(interest_results) >= book_Limit:
                    break

        # 장르 기반 추천
        genre_results = []
        for label, keywords in grouped_genres.items():
            group_books = [
                book for book in genre_pool
                if any(k in part for k in keywords for part in book.get("categoryName", "").split(">"))
            ]
            if not group_books:
                continue

            texts = [f"{b['title']} {b['description'][:100]}" for b in group_books]
            embeddings = model.encode(texts, convert_to_tensor=True)

            query_texts = [f"{b['title']} {b['description'][:100]}" for b in saved_books]
            query_vectors = model.encode(query_texts, convert_to_tensor=True)
            mean_vector = query_vectors.mean(dim=0, keepdim=True)

            sims = util.pytorch_cos_sim(mean_vector, embeddings)[0]
            top_indices = torch.topk(sims, k=min(3, len(group_books))).indices

            for idx_tensor in top_indices:
                idx = int(idx_tensor.item())
                book = group_books[idx]
                score = float(sims[idx].item())
                book["score"] = score
                book["normalized_score"] = round(score, 2)
                book["source"] = "genre"
                genre_results.append(book)

        # 최종 결과 구성
        combined_books = interest_results + genre_results
        final_books = sorted(set_book(combined_books), key=lambda b: b.get("score", 0), reverse=True)

        if len(final_books) < book_Limit:
            needed = book_Limit - len(final_books)
            additional = [b for b in genre_results if b["isbn13"] not in {f["isbn13"] for f in final_books}]
            final_books += additional[:needed]

        final_books = final_books[:book_Limit]
        print("📌 최종 추천 도서 수:", len(final_books))
        return jsonify({"books": final_books})

    except Exception as e:
        print("❌ [서버 오류]:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)

