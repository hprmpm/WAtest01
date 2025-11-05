import axios from 'axios';

async function generateQuiz() {
  try {
    const response = await axios.post('http://localhost:3000/quiz', {
      content: {
        id: 'v6_5i1yfr',
        title: 'Many a true word is spoken in jest. (嘘から出た真実)',
        number: '3',
        description: '期待の新人ヒーローを巡るHERO TVの取材...'
      }
    });

    console.log('✅ クイズ生成結果:');
    console.log(response.data);
  } catch (error) {
    console.error('❌ エラー:', error.response?.data || error.message);
  }
}

generateQuiz();