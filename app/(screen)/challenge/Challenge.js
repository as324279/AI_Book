import {useRouter,useLocalSearchParams} from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet,View,Text,Pressable } from "react-native";
import CustomHeader from '../../../components/CustomHeader';


const Challenge = ()=> {
    const router = useRouter();
    const {level,result} = useLocalSearchParams();
    const decodedResult = decodeURIComponent(result || '');

    return (
        <SafeAreaView style = {styles.safeArea}>
            <CustomHeader  showBack title="챌린지 결과" showIcons = {false}/>

            <View style = {styles.container}>
                <Text style = {styles.sectionTitle}> {level} 난이도</Text>
                <View style = {{marginTop:30}}>
                    <Text style = {{fontSize:14, fontWeight:'bold', marginBottom:10}}> 생성된 챌린지:</Text>
                    <Text>{decodedResult}</Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
export default Challenge;

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#FEF6F0',
    },
    container: {
      flex: 1,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#333',
    },
  });