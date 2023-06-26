import React, { useState, useEffect } from "react";
import "./App.css";
import { Configuration, OpenAIApi } from "openai";
import { useSpeechSynthesis } from "react-speech-kit";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

function App() {
  const [Medium, setMedium] = useState("");
  const [OnOff, setOnOff] = useState("");
  const { speak } = useSpeechSynthesis();
  const [listening, setListening] = useState(false);
  const [Output, setOutput] = useState([]);

  const {
    transcript,
    //  resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const startRecognition = () => {
    speechSynthesis.cancel();

    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening();
      setListening(true);
      setOnOff("On");
    } else {
      console.log("Speech recognition is not supported in this browser.");
    }
  };

  const stopRecognition = () => {
    SpeechRecognition.stopListening();
    setListening(false);
    setOnOff("off");
  };

  const resetTranscript = () => {
    setOnOff("Off");
    SpeechRecognition.abortListening();
    SpeechRecognition.startListening();
  };

  const RunPrompt = async (InputReq) => {
    setOnOff("Off");
    speechSynthesis.cancel();

    const config = new Configuration({
      apiKey: "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",
    });
    const openai = new OpenAIApi(config);
    const prompt = `${InputReq} ? Return response in the following JSON format:
{
"Q": "question",
"A": "answer"
}`;

    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 2048,
      temperature: 1,
    });

    const parsableJsonResponse = response.data.choices[0].text;
    // const filteredResponse = parsableJsonResponse.replace(/\{[^}]+\}/g, '');
    // console.log(filteredResponse);

    // Check if the response is empty
    if (!parsableJsonResponse) {
      console.log("Empty response received.");
      return;
    }

    try {
      const parsedResponse = JSON.parse(parsableJsonResponse);
      console.log(parsedResponse.Q);
      console.log(parsedResponse.A);
      setMedium(parsedResponse);
      addResponse(Medium);

      // inputReq='';
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
  };
  const addResponse = (Medium) => {
    setOutput([...Output, Medium]);
  };
const Speechcancel=()=>{
  speechSynthesis.cancel();
}
  const HandleClick = (Medium) => {
    speechSynthesis.cancel();
    // setText(Medium);
    speak({
      text: Medium.A,
      default: true,
      lang: "en-AU",
      localService: true,
      name: "Karen",
      URI: "Karen",
    });
    console.log("Handleclick");
    // const voices = speechSynthesis.getVoices();
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      RunPrompt(transcript);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [transcript]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      HandleClick(Medium);
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [Medium]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      speechSynthesis.cancel(); // Stop any ongoing speech synthesis
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className="whole">
      <h1>OpenAI Bot</h1>
      <div className="warn">
      <p>The project enables efficient speech-to-text conversion, text processing using OpenAI for generating responses, 
        and text-to-speech synthesis for generating output.<p> Click on "Ask a Question" to learn more.</p></p>
      <p>
        * The project primarily focuses on backend languages. Hence, Best viewed at
        Desktop
      </p></div>
      <div className="container">
        <div className="input">
          <button onClick={startRecognition}>Ask a Question</button>
          <div>Microphone: {OnOff}</div>
          
          {/* <div>Use this button for stop askign a question, in case listening doesn't stop automatically</div>
        <button onClick={stopRecognition}>Stop Asking</button> */}

          <button onClick={resetTranscript}>Reset Transcript</button>
                   <div className="transcript">{transcript}</div>
          <div className="redme">
            * For ambiguous statements, it is possible for OpenAI to
            self-develop questions and answer them. Try framing questions to get
            better results.
          </div>
          
          <button
            onClick={() => {
              RunPrompt(`${transcript}`);
            }}
          >
            Regenerate Response
          </button>
          <div className="redme">
            * Regenerate button can also be used to get more relevant answers,
            that too quicker.
          </div>
        </div>

        <div className="Response">
          {Medium && (
            <div>
              <div className="wrapover">
                <h3>~See your results here~</h3>
                {Output.map((Output, index) => (
                  <div className="shadowme">
                    <p key={index}>
                      <b>Q: </b>
                      {Output.Q}
                    </p>
                    <p key={index}>
                      <b>A: </b>
                      {Output.A}
                    </p>
                  </div>
                ))}
              </div>
              <div className="NewResp">
                <div>
                  <b>Q: </b>
                  {Medium.Q}
                </div>
                <div>
                  <b>A: </b>
                  {Medium.A}
                </div>
                <button
                  className="buttonStyle"
                  onClick={() => {
                    HandleClick(Medium);
                  }}
                >
                  Repeat the Answer
                </button>
                <button
                  className="buttonStyle"
                  onClick={() => {
                    Speechcancel();
                  }}
                >
                  Stop Speech
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
