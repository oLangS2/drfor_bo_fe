import React, { useEffect, useState } from "react";
import { Editor } from "@/components/Editor";
import HOOK_LM_POP from "@/store/hooks/hookPop";
import { useNavigate, useParams } from "react-router-dom";
import { LmAxios } from "@/axios/LmAxios";
import { LmImageFileUpload } from "@/components/LmImageFileUpload";
import { convertFileToBase64 } from "@/utils/fileUtils";
import { isCheckId, isCheckPw } from "@/utils/validationUtils";

export const WriteModifyForm = () => {
	const { consultantNo } = useParams();
	const { setLmPop } = HOOK_LM_POP();
	const navigate = useNavigate();
	const [phoneNumber, setPhoneNumber] = useState({
		phoneNumber0: "010",
		phoneNumber1: "",
		phoneNumber2: "",
	});
	const [editorContent, setEditorContent] = useState(""); // 에디터 내용 관리
	const [inputValues, setInputValues] = useState({
		memberName: "",
		memberId: "",
		password: "",
		memberPhone: "",
		status: "N",
		memberImage: "",
		imageName: "",
	});
	const [selectedFile, setSelectedFile] = useState(null);

	// input Change 이벤트
	const handleInputChange = (e) => {
		const { name, value, type } = e.target;

		if (type === "radio" && name === "status") {
			// 라디오 버튼 값 업데이트
			setInputValues({
				...inputValues,
				[name]: value,
			});
		} else if (name === "phoneNumber1" || name === "phoneNumber2") {
			// 숫자만 입력 받기
			const numericValue = value.replace(/\D/g, "");

			// 4자리 이상 입력 방지
			if (numericValue.length > 4) return;

			// phoneNumber를 업데이트
			setPhoneNumber((prevPhone) => ({
				...prevPhone,
				[name]: numericValue,
			}));
		} else if (name === "phoneNumber0") {
			// 전화번호 첫 번째 자리 (010, 011 등)
			setPhoneNumber((prevPhone) => ({
				...prevPhone,
				[name]: value,
			}));
		} else {
			// 일반 입력 필드 업데이트
			setInputValues({
				...inputValues,
				[name]: value,
			});
		}
	};

	// 전화번호가 변경될 때마다 memberPhone을 업데이트
	useEffect(() => {
		setInputValues((prevValues) => ({
			...prevValues,
			memberPhone: phoneNumber.phoneNumber0 + phoneNumber.phoneNumber1 + phoneNumber.phoneNumber2,
		}));
	}, [phoneNumber]); // phoneNumber가 변경될 때마다 실행

	// 파일첨부 기능
	const handleFileChange = (files) => {
		if (files) {
			setSelectedFile(files);
			setInputValues({
				...inputValues,
				imageName: files.name,
			});
		} else {
			setSelectedFile(null);
			setInputValues((prevValues) => ({
				...prevValues,
				imageName: "",
			}));
		}
	};

	// 등록 버튼 클릭 시 모든 항목 유효성 검사 후 API 호출
	const handleSubmit = () => {
		if (
			!inputValues.memberId ||
			!inputValues.memberName ||
			!inputValues.password ||
			!phoneNumber.phoneNumber1 ||
			!phoneNumber.phoneNumber2
		) {
			setLmPop({
				show: true,
				type: "alert",
				contents: "필수 항목을 입력해주세요.",
			});
			return;
		}

		if (!isCheckId(inputValues.memberId)) {
			setLmPop({
				show: true,
				type: "alert",
				contents: "아이디 규칙을 확인해주시기 바랍니다.",
			});
			return;
		}
		if (!isCheckPw(inputValues.password)) {
			setLmPop({
				show: true,
				type: "alert",
				contents: "비밀번호 규칙을 확인해주시기 바랍니다.",
			});
			return;
		}

		setLmPop({
			show: true,
			type: "confirm",
			contents: "상담사 정보를 등록하시겠습니까?",
			success_fun: async () => {
				let base64 = ""; // base64 변수를 조건문 외부에서 선언

				// selectedFile이 있는 경우에만 Base64로 변환
				if (selectedFile) {
					base64 = await convertFileToBase64(selectedFile);
				}

				await LmAxios({
					method: "post",
					url: "/admin/consultant",
					data: {
						memberName: inputValues.memberName,
						memberId: inputValues.memberId,
						password: inputValues.password,
						memberPhone: inputValues.memberPhone,
						memberImage: base64,
						imageName: inputValues.imageName,
						introduction: editorContent,
						status: inputValues.status,
					},
				})
					.then((res) => {
						if (res.data.code === "0000") {
							setLmPop({
								show: true,
								type: "alert",
								contents: "상담사 정보가 등록되었습니다.",
								success_fun: (hidepop) => {
									hidepop();
									navigate("/consultant");
								},
							});
						} else {
							setLmPop({
								show: true,
								type: "alert",
								contents: res.data.message,
								success_fun: (hidepop) => {
									hidepop();
								},
							});
						}
					})
					.catch((error) => {
						console.error("postName API 호출 실패:", error);
					});
			},
		});
	};

	// 상담사 등록 후 수정상태 일 경우
	// 상담사 상세 조회
	useEffect(() => {
		if (!consultantNo) return;

		const getConsultantDetail = async () => {
			await LmAxios({
				method: "GET",
				url: `/admin/consultant/${consultantNo}`,
			})
				.then((res) => {
					if (res.data.code === "0000") {
						const result = res.data.result;

						// 상담사 사용여부가 "삭제" 일경우 상담사 목록으로 뒤로가기
						if (result.status === "D") {
							navigate("/consultant");

							return;
						}

						setInputValues({
							memberName: result.memberName || "",
							memberId: result.memberId || "",
							password: "",
							status: result.status,
							imageName: result.imageName || "",
							memberImage: result.image || "",
						});

						if (result?.introduction) {
							setEditorContent(result.introduction); //에디터 영역 저장
						}

						setEditorContent(result.introduction);

						// memberPhone 값을 phoneNumber 상태에 나눠서 업데이트
						const memberPhone = result.memberPhone || "";
						const phoneNumber0 = memberPhone.substring(0, 3);
						const phoneNumber1 = memberPhone.substring(3, 7);
						const phoneNumber2 = memberPhone.substring(7, 11);

						setPhoneNumber({
							phoneNumber0: phoneNumber0 || "010", // 기본값 "010"
							phoneNumber1: phoneNumber1 || "",
							phoneNumber2: phoneNumber2 || "",
						});
					}
				})
				.catch((error) => {
					console.error("getName API 호출 실패:", error);
				});
		};

		getConsultantDetail();
	}, []);

	const handleEditorChange = (content) => {
		setEditorContent(content); // Editor 컴포넌트에서 전달된 값 저장
	};

	// 임시 비밀번호 발급
	const handlePasswordClik = () => {
		const patchPasswordIssue = async () => {
			await LmAxios({
				method: "patch",
				url: `/admin/consultant/${consultantNo}/password`,
			})
				.then((res) => {
					if (res.data.code === "0000") {
						setLmPop({
							show: true,
							type: "alert",
							contents: "임시 비밀번호가 전송되었습니다.",
							success_fun: (hidepop) => {
								hidepop();
							},
						});
					} else {
						setLmPop({
							show: true,
							type: "alert",
							contents: res.data.message,
						});
					}
				})
				.catch((error) => {
					console.error("postName API 호출 실패:", error);
				});
		};
		patchPasswordIssue();
	};

	// 상담사 정보 삭제
	const handleDelete = () => {
		setLmPop({
			show: true,
			type: "confirm",
			contents: "해당 계정을 삭제하시겠습니까?",
			success_fun: async () => {
				await LmAxios({
					method: "DELETE",
					url: `/admin/consultant/${consultantNo}`,
				})
					.then((res) => {
						if (res.data.code === "0000") {
							setLmPop({
								show: true,
								type: "alert",
								content: "해당 계정이 삭제되었습니다.",
								success_fun: (hidepop) => {
									hidepop();
									navigate("/consultant");
								},
							});
						}
					})
					.catch((error) => {
						console.error("deleteName API 호출 실패:", error);
					});
			},
		});
	};

	// 상담사 정보 수정
	const handleModify = () => {
		if (!phoneNumber.phoneNumber1 || !phoneNumber.phoneNumber2) {
			setLmPop({
				show: true,
				type: "alert",
				contents: "필수 항목을 입력해주세요.",
			});
			return;
		}

		setLmPop({
			show: true,
			type: "confirm",
			contents: "상담사 정보를 수정하시겠습니까?",
			success_fun: async () => {
				let base64 = ""; // base64 변수를 조건문 외부에서 선언

				// selectedFile이 있는 경우에만 Base64로 변환
				if (selectedFile) {
					base64 = await convertFileToBase64(selectedFile);
				}

				if (base64 === "") {
					base64 = inputValues.memberImage;
				}

				//NOTE 수정 API 호출 시 새로 선택된 파일(selectedFile)이 없으면 기존의 inputValues.memberImage : 상세 조회시 내려받은 IMG URL을 전송한다.
				await LmAxios({
					method: "put",
					url: `/admin/consultant/${consultantNo}`,
					data: {
						memberName: inputValues.memberName,
						memberPhone: inputValues.memberPhone,
						memberImage: base64,
						imageName: inputValues.imageName,
						introduction: editorContent,
						status: inputValues.status,
					},
				})
					.then((res) => {
						if (res.data.code === "0000") {
							setLmPop({
								show: true,
								type: "alert",
								contents: "상담사 정보가 수정되었습니다.",
								success_fun: (hidepop) => {
									hidepop();
									navigate("/consultant");
								},
							});
						} else {
							setLmPop({
								show: true,
								type: "alert",
								contents: res.data.message,
							});
						}
					})
					.catch((error) => {
						console.error("postName API 호출 실패:", error);
					});
			},
		});
	};
	//// 상담사 등록 후 수정상태 일 경우

	return (
		<div className="lm-container consultant-wrap">
			{/* 콘텐츠 영역 */}
			<div className="lm-card-wrap">
				<div className="lm-card padding-1">
					<div className="lm-title-box">
						<div className="lm-text title2 mb-12">상담사 기본정보</div>
					</div>
					<table className="lm-table">
						<tbody>
							<tr>
								<th className="w-120">이름</th>
								<td>
									<input
										disabled={consultantNo}
										type="text"
										name="memberName"
										className="lm-input"
										placeholder="이름을 입력하세요"
										value={inputValues.memberName}
										onChange={handleInputChange}
									/>
								</td>
							</tr>
							<tr>
								<th className="w-120">아이디</th>
								<td>
									<input
										disabled={consultantNo}
										type="text"
										name="memberId"
										className="lm-input"
										value={inputValues.memberId}
										onChange={handleInputChange}
									/>
									<p className="lm-text caption1 lm-gray-2 mt-6">
										영문소문자+숫자를 조합하여 4자이상 ~ 16자 이하 첫 번째 문자는 영문소문자만
										가능합니다.
									</p>
								</td>
								{!consultantNo ? (
									<>
										<th>초기비밀번호</th>
										<td>
											<input
												className="lm-input"
												type="password"
												name="password"
												value={inputValues.password}
												onChange={handleInputChange}
											/>
											<p className="lm-text caption1 lm-gray-2 mt-6">
												영문 소문자, 숫자, 특수기호를 2종 이상 조합하여, 8~16자
											</p>
										</td>
									</>
								) : (
									<>
										<th>임시비밀번호</th>
										<td>
											<button className="lm-button password-btn" onClick={handlePasswordClik}>
												임시비밀번호 발급
											</button>
										</td>
									</>
								)}
							</tr>
							<tr>
								<th className="w-120">휴대폰번호</th>
								<td>
									<div className="lm-flex gap-6">
										<select
											name="phoneNumber0"
											className="lm-select"
											value={phoneNumber.phoneNumber0}
											onChange={handleInputChange}
										>
											<option value="010">010</option>
											<option value="011">011</option>
											<option value="016">016</option>
											<option value="017">017</option>
											<option value="018">018</option>
											<option value="019">019</option>
										</select>
										<input
											type="text"
											name="phoneNumber1"
											className="lm-input"
											value={phoneNumber.phoneNumber1}
											onChange={handleInputChange}
										/>
										<input
											type="text"
											name="phoneNumber2"
											className="lm-input"
											value={phoneNumber.phoneNumber2}
											onChange={handleInputChange}
										/>
									</div>
								</td>
								<th className="w-120">사용여부</th>
								<td>
									<input
										type="radio"
										id="radio1"
										className="lm-radio-input"
										name="status"
										value="Y"
										checked={inputValues.status === "Y"}
										onChange={handleInputChange}
									/>
									<label htmlFor="radio1">사용</label>
									<input
										type="radio"
										id="radio2"
										className="lm-radio-input"
										name="status"
										value="N"
										checked={inputValues.status === "N"}
										onChange={handleInputChange}
									/>
									<label htmlFor="radio2">미사용</label>
								</td>
							</tr>
							<tr>
								<th>상담사 사진등록</th>
								<td>
									<LmImageFileUpload
										onFileChange={handleFileChange}
										initialImage={inputValues.imageName}
									/>
									<p className="lm-text caption1 lm-gray-2 mt-6">
										이미지 파일(jpg, png, gif)만 등록해 주세요.
										<br />
										5mb 이내 사이즈 1건 업로드 가능합니다.
									</p>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div className="lm-card padding-1">
					<div className="lm-title-box">
						<div className="lm-text title2 mb-12">상담사 상세정보</div>
					</div>
					<div className="lm-card-top">
						<div className="lm-editor">
							{/* 에디터 컴포넌트 추가 */}
							<Editor onChange={handleEditorChange} value={editorContent} />
						</div>
					</div>
				</div>
			</div>

			{/* 사이드 메뉴 */}
			<div className="side-box">
				<div className="btn-box">
					{!consultantNo ? (
						<div className="lm-flex gap-6">
							<button className="lm-button line lm-flex-1" onClick={() => navigate(-1)}>
								취소
							</button>
							<button className="lm-button color-1 lm-flex-1" onClick={handleSubmit}>
								등록
							</button>
						</div>
					) : (
						<>
							<div className="lm-flex gap-6">
								<button className="lm-button line lm-flex-1" onClick={() => navigate(-1)}>
									취소
								</button>
								<button className="lm-button line font-color-4 lm-flex-1 " onClick={handleDelete}>
									삭제
								</button>
							</div>
							<button className="lm-button w-full mt-6 color-black" onClick={handleModify}>
								수정
							</button>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
