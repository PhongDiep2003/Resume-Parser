import { useState} from 'react'
import './App.css'
function App() {
  const [keywords, setKeywords] = useState([])
  const [keyword, setKeyword] = useState('')
  const [files, setFiles] = useState([])
  const [mockFiles, setMockFiles] = useState([])
  const [preview, setPreview] = useState(null)
  const [matchingRes, setMatchingRes] = useState(null)

  const handleUpload = async() => {
    let highest_matching_score = 0
    let index_of_highest_matching_file = -1
    let res = {}
    if (keywords.length === 0 || files.length === 0) {
      alert('Please enter keywords or upload resume.')
      return
    }
    //send file to extrack skills 1 by 1
    for (let i = 0; i < files.length; i++) {
      const data = await handleExtractingSkills(files[i])

      index_of_highest_matching_file = highest_matching_score < data.matching_score ? i : index_of_highest_matching_file

      res = highest_matching_score < data.matching_score ? data : res

      highest_matching_score = highest_matching_score < data.matching_score ? data.matching_score : highest_matching_score
      
    } 
    
    if (index_of_highest_matching_file !== -1 && highest_matching_score != 0) {
      const file = files[index_of_highest_matching_file]
      if (file) {
        // highlight the matching keywords
        const data = await handleHighlightingSkills(file)
        console.log(data)
        if (data.success) {
          // If request is handled successfully, the new modified file should have been saved at the tmp folder
          const response = await fetch('http://127.0.0.1:8000/get_file/' + data.filename)
          const blob = await response.blob()
          const objectURL = URL.createObjectURL(blob)
          setPreview(objectURL)
          setMatchingRes(res)
        }
      }

    }
    
  }

  const handleHighlightingSkills = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      keywords.forEach((keyword) => {
        formData.append('skills', keyword);
      })
      const response = await fetch('http://127.0.0.1:8000/highlight_skills', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      return data
    } catch(error) {
      alert('Error in highlighting skills in resume. Please try again later.')
      console.log(error)
    }
  }

  const handleExtractingSkills = async (file) => {
    try {
      //Create a form data object to send file and keywords
      //The reason FonrmData is used is because it can send binary data like files and other types very efficiently
      const formData = new FormData()
      formData.append('file', file)
      keywords.forEach((keyword) => {
        formData.append('skills', keyword);  // appending each skill
      });
      const response = await fetch('http://127.0.0.1:8000/extract_skills', {
        method: 'POST',
        body: formData
      })
     
      const data = await response.json()
      return data

    } catch(error) {
      alert(
        'Error in extracting skills from resume. Please try again later.'
      )
      console.log(error)
    }

  }


  const parse_resume = () =>  (<div className='app_container'>
<h2>Resume Parser</h2>
<div className='grid_container'>
  <div className='grid_item'> 
    {/* enter keyword for resume parsing */}
    <h3>Enter Keyword</h3>
    <div className="input_container">
      <input type="text" required="required" onChange={e => setKeyword(e.target.value)} value={keyword} onKeyDown={(e) => {
        if (e.key === 'Enter' && keyword !== '') {
          if (!keywords.includes(keyword.toUpperCase())) {
            setKeywords(prev => [...prev, keyword.toUpperCase()])
          }
          setKeyword('')
        }
      }}/>
      <label>Keyword</label>
      <i></i>
      <button className='clearBtn' onClick={() => setKeywords([])}>Clear</button>
    </div>
    {/* display keyword */}
    <div className='keywords_container'>
      {keywords.map((keyword, index) => (
        <div key={index} className='keyword'>
          <span>{keyword}</span>
        </div>
      ))}
    </div>
  </div>
  <div className='grid_item'>
    {/* upload resume */}
    <h3>Upload Resume</h3>
    <input id='file' type='file' accept='.pdf' onChange={(e) => {
      if (e.target.files[0]) {
        if (!mockFiles.includes(e.target.files[0].name)) {
          setMockFiles(prev => [...prev, e.target.files[0].name])
          setFiles(prev => [...prev, e.target.files[0]])  
        }
      }
      }}
      />
    <label htmlFor="file" className='labelStyle'>
      Select Files
    </label>
    <button className='clearBtn' onClick={() => {
      setFiles([])
      setMockFiles([])
    }}>Clear</button>
    {/* display uploaded resume */}
    <div className='keywords_container'>
      {mockFiles && mockFiles.map((file, index) => (
        <div key={index} className='keyword'>
          <span>{file}</span>
        </div>
      ))}
    </div>
  </div>
</div>
<div className='uploadBtn'> 
  <button onClick={handleUpload}>Upload</button>
</div>
</div>)

const show_result = () => (
  <div className='result_page'>
    <h2>Most matched resume</h2>
    <div className='previewContainer'>
      <iframe src={preview} title='Preview' className='preview' width={'100%'} height={'100%'} ></iframe>
    </div>
    <div className='go_back' onClick={go_back}>
      <svg className='icon' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/>
      </svg>
    </div>
  </div>
)

const go_back = async () => {
  const response = await fetch('http://127.0.0.1:8000/delete_dir')
  const data = await response.json()
  if (!data.success) {
    alert('Error in deleting files. Please try again later.')
  }
  setPreview(null)
  setMatchingRes(null)
  setKeywords([])
  setFiles([])
  setMockFiles([])
  setKeyword('')
}






  if (!preview && !matchingRes) {
    return parse_resume()
  }
  else {
    return show_result()
  }

}








export default App

