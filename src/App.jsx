import { useState, useEffect, useRef} from 'react'
import './App.css'
function App() {
  const [keywords, setKeywords] = useState([])
  const [keyword, setKeyword] = useState('')
  const [files, setFiles] = useState([])
  const [mockFiles, setMockFiles] = useState([])
  const [preview, setPreview] = useState(null)
  const [matchingRes, setMatchingRes] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const scrollKeywordRef = useRef(null);
  const scrollResumeRef = useRef(null);

  useEffect(() => {
    const scrollElement = scrollKeywordRef.current;
    if (scrollElement.scrollHeight > scrollElement.clientHeight) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
    }
}, [keywords]);

useEffect(() => {
  const scrollElement = scrollResumeRef.current;
  if (scrollElement.scrollHeight > scrollElement.clientHeight) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
  }
}, [files, mockFiles]);
  const handleUpload = async() => {
    setIsLoading(true)
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
        if (data.success) {
          // If request is handled successfully, the new modified file should have been saved at the tmp folder
          const response = await fetch('https://resume-parser-backend-hopicsafcq-uc.a.run.app/get_file/' + data.filename)
          const blob = await response.blob()
          const objectURL = URL.createObjectURL(blob)
          setPreview(objectURL)
          setMatchingRes(res)
        }
      }

    }
    setIsLoading(false)
  }

  const handleHighlightingSkills = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      keywords.forEach((keyword) => {
        formData.append('skills', keyword);
      })
      const response = await fetch('https://resume-parser-backend-hopicsafcq-uc.a.run.app/highlight_skills', {
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
      const response = await fetch('https://resume-parser-backend-hopicsafcq-uc.a.run.app/extract_skills', {
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


const parse_resume = () =>  (
          <div className='app_container'>
          <div className='header'>
            <h2>Resume Parser</h2>
          </div>
          <div className='grid_container'>
            <div className='grid_item'> 
              {/* enter keyword for resume parsing */}
              <h3>Enter Keyword</h3>
              <div className="input_container">
                <input type="text" required="required" maxLength={20} onChange={e => setKeyword(e.target.value)} value={keyword} disabled={isLoading} onKeyDown={(e) => {
                  if (e.key === 'Enter' && keyword !== '') {
                    if (!keywords.includes(keyword.toUpperCase())) {
                      setKeywords(prev => [...prev, keyword.toUpperCase()])
                    }
                    setKeyword('')
                  }
                }}/>
                <label>Keyword</label>
                <i></i>
                <button className='clearBtn' disabled={isLoading} onClick={() => setKeywords([])}>Clear</button>
              </div>
              {/* display keyword */}
              <div className='keywords_container' ref={scrollKeywordRef}>
                {keywords.map((keyword, index) => (
                  <div key={index} className='keyword'>
                    <span>{keyword}</span>
                    <span className='trash' onClick={() => setKeywords(prev => prev.filter((e) => e != keyword))}>
                        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50" enable-background="new 0 0 50 50" xml:space="preserve">
                        <path fill="#231F20" d="M10.289,14.211h3.102l1.444,25.439c0.029,0.529,0.468,0.943,0.998,0.943h18.933
                          c0.53,0,0.969-0.415,0.998-0.944l1.421-25.438h3.104c0.553,0,1-0.448,1-1s-0.447-1-1-1h-3.741c-0.055,0-0.103,0.023-0.156,0.031
                          c-0.052-0.008-0.1-0.031-0.153-0.031h-5.246V9.594c0-0.552-0.447-1-1-1h-9.409c-0.553,0-1,0.448-1,1v2.617h-5.248
                          c-0.046,0-0.087,0.021-0.132,0.027c-0.046-0.007-0.087-0.027-0.135-0.027h-3.779c-0.553,0-1,0.448-1,1S9.736,14.211,10.289,14.211z
                          M21.584,10.594h7.409v1.617h-7.409V10.594z M35.182,14.211L33.82,38.594H16.778l-1.384-24.383H35.182z"></path>
                        <path fill="#231F20" d="M20.337,36.719c0.02,0,0.038,0,0.058-0.001c0.552-0.031,0.973-0.504,0.941-1.055l-1.052-18.535
                          c-0.031-0.552-0.517-0.967-1.055-0.942c-0.552,0.031-0.973,0.504-0.941,1.055l1.052,18.535
                          C19.37,36.308,19.811,36.719,20.337,36.719z"></path>
                        <path fill="#231F20" d="M30.147,36.718c0.02,0.001,0.038,0.001,0.058,0.001c0.526,0,0.967-0.411,0.997-0.943l1.052-18.535
                          c0.031-0.551-0.39-1.024-0.941-1.055c-0.543-0.023-1.023,0.39-1.055,0.942l-1.052,18.535C29.175,36.214,29.596,36.687,30.147,36.718
                          z"></path>
                        <path fill="#231F20" d="M25.289,36.719c0.553,0,1-0.448,1-1V17.184c0-0.552-0.447-1-1-1s-1,0.448-1,1v18.535
                          C24.289,36.271,24.736,36.719,25.289,36.719z"></path>
                        </svg>
                  </span>
                  </div>
                ))}
                
              </div>
            </div>
            <div className='grid_item'>
              {/* upload resume */}
              <h3>Upload Resume</h3>
              <input id='file' type='file' accept='.pdf' disabled={isLoading} onChange={(e) => {
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
              <button className='clearBtn' disabled={isLoading} onClick={() => {
                setFiles([])
                setMockFiles([])
              }}>Clear</button>
              {/* display uploaded resume */}
              <div className='keywords_container' ref={scrollResumeRef}>
                {mockFiles && mockFiles.map((file, index) => (
                  <div key={index} className='keyword'>
                    <span>{file}</span>
                    <span className='trash' onClick={() => {
                      setFiles(prev => prev.filter((e) => e.name !== file))
                      setMockFiles(prev => prev.filter((e) => e !== file))
                    } }>
                        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 50 50" enable-background="new 0 0 50 50" xml:space="preserve">
                        <path fill="#231F20" d="M10.289,14.211h3.102l1.444,25.439c0.029,0.529,0.468,0.943,0.998,0.943h18.933
                          c0.53,0,0.969-0.415,0.998-0.944l1.421-25.438h3.104c0.553,0,1-0.448,1-1s-0.447-1-1-1h-3.741c-0.055,0-0.103,0.023-0.156,0.031
                          c-0.052-0.008-0.1-0.031-0.153-0.031h-5.246V9.594c0-0.552-0.447-1-1-1h-9.409c-0.553,0-1,0.448-1,1v2.617h-5.248
                          c-0.046,0-0.087,0.021-0.132,0.027c-0.046-0.007-0.087-0.027-0.135-0.027h-3.779c-0.553,0-1,0.448-1,1S9.736,14.211,10.289,14.211z
                          M21.584,10.594h7.409v1.617h-7.409V10.594z M35.182,14.211L33.82,38.594H16.778l-1.384-24.383H35.182z"></path>
                        <path fill="#231F20" d="M20.337,36.719c0.02,0,0.038,0,0.058-0.001c0.552-0.031,0.973-0.504,0.941-1.055l-1.052-18.535
                          c-0.031-0.552-0.517-0.967-1.055-0.942c-0.552,0.031-0.973,0.504-0.941,1.055l1.052,18.535
                          C19.37,36.308,19.811,36.719,20.337,36.719z"></path>
                        <path fill="#231F20" d="M30.147,36.718c0.02,0.001,0.038,0.001,0.058,0.001c0.526,0,0.967-0.411,0.997-0.943l1.052-18.535
                          c0.031-0.551-0.39-1.024-0.941-1.055c-0.543-0.023-1.023,0.39-1.055,0.942l-1.052,18.535C29.175,36.214,29.596,36.687,30.147,36.718
                          z"></path>
                        <path fill="#231F20" d="M25.289,36.719c0.553,0,1-0.448,1-1V17.184c0-0.552-0.447-1-1-1s-1,0.448-1,1v18.535
                          C24.289,36.271,24.736,36.719,25.289,36.719z"></path>
                        </svg>
                        </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className='uploadBtn'> 
            <button onClick={handleUpload} disabled={isLoading}>Upload</button>
          </div>
          </div>
      )

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
  setIsLoading(true)
  const response = await fetch('https://resume-parser-backend-hopicsafcq-uc.a.run.app/delete_dir')
  const data = await response.json()
  console.log(data)
  if (!data.success) {
    alert('Error in deleting files. Please try again later.')
  }
  setPreview(null)
  setMatchingRes(null)
  setKeywords([])
  setFiles([])
  setMockFiles([])
  setKeyword('')
  setIsLoading(false)
}






  if (!preview && !matchingRes) {
    return parse_resume()
  }
  else {
    return show_result()
  }

}








export default App

