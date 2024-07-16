import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { nanoid } from "nanoid";
import { ToastContainer } from "react-toastify";
import "./CreateTest.css";
import { handleSuccess } from "../../utils";

const CreateTest = () => {
  const [loggedInUser, setLoggedInUser] = useState("");
  const [ques, setQues] = useState([]);
  const [testName, setTestName] = useState();
  const [testDuration, setTestDuration] = useState();
  const [tracker, setTracker] = useState([]);
  const [testID, setTestID] = useState(nanoid(8));
  const [ansKey, setAnsKey] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoggedInUser(localStorage.getItem("loggedInUser"));
  }, []);

  const handleAddQuestion = () => {
    setQues([...ques, { quesText: "", options: [] }]);
    setTracker([...tracker, { qText: null, op: [] }]);
    setAnsKey((prev) => (prev += "?"));
  };

  const handleChangeQuestionText = (newText, quesIndex) => {
    const updatedQuestions = [...ques];
    updatedQuestions[quesIndex].quesText = newText;
    setQues(updatedQuestions);
  };

  const handleDeleteQuestion = (quesIndex) => {
    setQues((prevQuestions) => {
      return prevQuestions.filter((question, i) => i !== quesIndex);
    });

    setTracker((prevTracker) => {
      return prevTracker.filter((tracker, i) => i !== quesIndex);
    });
  };

  const handleAddTextOption = (quesIndex) => {
    const updatedQuestions = [...ques];
    updatedQuestions[quesIndex].options.push("");
    setQues(updatedQuestions);

    const updatedTracker = [...tracker];
    updatedTracker[quesIndex].op.push({ img: null, up: false });
    setTracker(updatedTracker);
  };

  const handleTextOption = (e, quesIndex, optionIndex) => {
    const updatedQuestions = [...ques];
    updatedQuestions[quesIndex].options[optionIndex] = e.target.value;
    setQues(updatedQuestions);
  };

  const handleAddImageOption = (quesIndex) => {
    const updatedQuestions = [...ques];
    updatedQuestions[quesIndex].options.push({
      type: "image",
      name: "",
      file: "",
    });
    setQues(updatedQuestions);

    const updatedTracker = [...tracker];
    updatedTracker[quesIndex].op.push({ img: null, up: true });
    setTracker(updatedTracker);
  };

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const handleImageUpload = async (e, quesIndex, optionIndex) => {
    const ss = e.target.files[0];
    if (!ss) return;

    const temp = await toBase64(ss);
    const updatedQuestions = [...ques];

    updatedQuestions[quesIndex].options[optionIndex].name = ss.name;
    updatedQuestions[quesIndex].options[optionIndex].file = temp;

    setQues(updatedQuestions);

    const updatedTracker = [...tracker];
    updatedTracker[quesIndex].op[optionIndex].img = ss;
    updatedTracker[quesIndex].op[optionIndex].up = false;
    setTracker(updatedTracker);
  };

  const handleEditImage = (quesIndex, optionIndex) => {
    const updatedTracker = [...tracker];
    updatedTracker[quesIndex].op[optionIndex].img = null;
    updatedTracker[quesIndex].op[optionIndex].up = true;
    setTracker(updatedTracker);
  };

  const renderImage = (optionName, quesIndex, optionIndex) => {
    const curTracker = [...tracker];
    const curimg = curTracker[quesIndex].op[optionIndex].img;
    const curup = curTracker[quesIndex].op[optionIndex].up;

    if (curimg === null && curup === true) {
      return (
        <ul style={{ display: "flex" }}>
          <input
            type="checkbox"
            onChange={(e) => {
              handleChangeOption(e, quesIndex, optionIndex);
            }}
            checked={
              ansKey[quesIndex] === "?" ||
              ansKey[quesIndex].charCodeAt(0) - 48 - 1 !== optionIndex
                ? false
                : true
            }
          />

          <input
            className="imgop"
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, quesIndex, optionIndex)}
          />

          <button
            className="delopbtn"
            onClick={() => handleDeleteOption(quesIndex, optionIndex)}
          >
            Delete Option
          </button>
        </ul>
      );
    } else if (curimg != null && curup === false) {
      return (
        <ul style={{ display: "flex" }}>
          <input
            type="checkbox"
            onChange={(e) => {
              handleChangeOption(e, quesIndex, optionIndex);
            }}
            checked={
              ansKey[quesIndex] === "?" ||
              ansKey[quesIndex].charCodeAt(0) - 48 - 1 !== optionIndex
                ? false
                : true
            }
          />

          <p className="imgtxt">{optionName}</p>

          <button
            className="editimgopbtn"
            onClick={() => handleEditImage(quesIndex, optionIndex)}
          >
            Edit Image
          </button>

          <button
            className="delopbtn"
            onClick={() => handleDeleteOption(quesIndex, optionIndex)}
          >
            Delete Option
          </button>
        </ul>
      );
    }
  };

  const handleChangeOption = (e, quesIndex, optionIndex) => {
    var updatedAnsKey = ansKey;
    updatedAnsKey = updatedAnsKey.split("");
    updatedAnsKey[quesIndex] = optionIndex + 1;
    updatedAnsKey = updatedAnsKey.join("");

    setAnsKey(updatedAnsKey);
  };

  const handleDeleteOption = (quesIndex, optionIndex) => {
    const updatedQuestions = [...ques];
    updatedQuestions[quesIndex].options.splice(optionIndex, 1);
    setQues(updatedQuestions);

    const updatedTracker = [...tracker];
    updatedTracker[quesIndex].op.splice(optionIndex, 1);
    setTracker(updatedTracker);
  };

  const handleCreateTest = (e) => {
    e.preventDefault();

    const data = {
      testID: testID,
      createdBy: loggedInUser,
      testName: testName,
      testDuration: testDuration,
      questions: ques,
      anskey: ansKey,
      tookBy: [],
    };

    console.log(data);

    axios
      .post("http://localhost:5000/createtest", data)
      .then((result) => {
        console.log(result.data);
        handleSuccess("Test created successfully.");
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="container">
      <div className="starter">
        <h1>Create Test</h1>

        <button
          className="gobackbtn"
          onClick={() => {
            navigate("/dashboard");
          }}
        >
          Go to Dashboard
        </button>
      </div>

      <div>
        <div className="itemm">
          <p className="itempara1">Enter Test Name</p>
          <input
            className="iteminput1"
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
          />
        </div>

        <div className="itemm">
          <p className="itempara2">
            Enter Test Duration in HH:MM:SS format. (e.g. If 1 hour 30 mins
            test, enter 01:30:00) :
          </p>

          <input
            className="iteminput2"
            type="text"
            value={testDuration}
            onChange={(e) => setTestDuration(e.target.value)}
          />
        </div>

        <div className="itemm">
          <p className="itempara2">Test Code: {testID}</p>
          <button className="gencodebtn" onClick={() => setTestID(nanoid(8))}>
            Generate new code
          </button>
        </div>

        <button className="addquesbtn" onClick={() => handleAddQuestion()}>
          Add new question
        </button>
        <button className="createtestbtn" onClick={(e) => handleCreateTest(e)}>
          Create test
        </button>
      </div>

      <div className="quescontainer">
        {ques.map((question, index) => {
          return (
            <div className="quesitem" key={index}>
              Question {index + 1}:
              <input
                className="questxt"
                type="text"
                value={question.quesText}
                onChange={(e) =>
                  handleChangeQuestionText(e.target.value, index)
                }
                placeholder="Enter Question"
              />
              <button
                className="delquesbtn"
                onClick={() => handleDeleteQuestion(index)}
              >
                Delete Question
              </button>
              <button
                className="addopbtn"
                onClick={() => handleAddTextOption(index)}
              >
                Add text as option
              </button>
              <button
                className="addopbtn"
                onClick={() => handleAddImageOption(index)}
              >
                Add image as option
              </button>
              {question.options.map((option, optionIndex) => {
                return (
                  <div className="option" key={optionIndex}>
                    {option.type === "image" ? (
                      renderImage(option.name, index, optionIndex)
                    ) : (
                      <ul style={{ display: "flex" }}>
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            handleChangeOption(e, index, optionIndex);
                          }}
                          checked={
                            ansKey[index] === "?" ||
                            ansKey[index].charCodeAt(0) - 48 - 1 !== optionIndex
                              ? false
                              : true
                          }
                        />

                        <input
                          className="opinput"
                          type="text"
                          key={optionIndex}
                          value={option}
                          onChange={(e) =>
                            handleTextOption(e, index, optionIndex)
                          }
                          placeholder={`Option ${optionIndex + 1}`}
                        />

                        <button
                          className="delopbtn"
                          onClick={() => handleDeleteOption(index, optionIndex)}
                        >
                          Delete Option
                        </button>
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <ToastContainer />
    </div>
  );
};

export default CreateTest;
