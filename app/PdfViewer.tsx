"use client";
import React, { useState, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

import './Sample.css';
import {PDFDocumentProxy} from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const options = {
    cMapUrl: '/cmaps/',
    standardFontDataUrl: '/standard_fonts/',
};

type PDFFile = File | undefined;

export default function PdfViewer() {
    const [file, setFile] = useState<PDFFile>();
    const [rawFile, setRawFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(1);
    const [page, setPage] = useState<number>(1);
    const [question, setQuestion] = useState<string>('');
    const [RagApiKey, setRagApiKey] = useState<string>('');
    const [OpenaiKey, setOpenaiKey] = useState<string>('');
    const [questionHistory, setQuestionHistory] = useState<string[]>([]);
    const [answer, setAnswer] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);


    const [tempQuestion, setTempQuestion] = useState<string>(''); // Temporary question storage

    // ... Other functions ...

    function handleAskQuestion() {
        setIsLoading(true)
        console.log(isLoading)
        setQuestion(tempQuestion);
        fetchAnswerFromAPI(tempQuestion)
    }

    function onFileChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const { files } = event.target;

        if (files && files[0]) {
            setFile(files[0] || null);
            setRawFile(files[0] || null);
            // Reset the page to the first page when changing the file.
            setPage(1);
        }
    }

    function onDocumentLoadSuccess(pdf: PDFDocumentProxy): void {
        const { numPages } = pdf;
        setNumPages(numPages);
    }

    function goToNextPage() {
        if (page < numPages) {
            setPage(page + 1);
        }
    }

    function goToPreviousPage() {
        if (page > 1) {
            setPage(page - 1);
        }
    }

    async function fetchAnswerFromAPI(question: string) {
        try {
            if (rawFile === null) return "Can`t use without a file"
            const formData = new FormData();
            formData.append('file', rawFile)
            formData.append('question', question)
            formData.append('openai_key', OpenaiKey)
            const response = await fetch('https://api.ragapi.org/question', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${RagApiKey}`,
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const data = await response.json();

            if (data.answer) {
                setAnswer(data.answer);
                setQuestionHistory([question]);
            } else {
                setAnswer('No answer found for this question.');
            }
        } catch (error) {
            console.error('API request failed:', error);
            setAnswer('Failed to retrieve an answer. Please try again.');
        }
        finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="Example">
            <div className="Example__container">
                <div className="Example__container__load">
                    <label htmlFor="file">Load from file:</label>{' '}
                    <input onChange={onFileChange} type="file" />
                </div>
                <h1 className="text-white mt-4 mb-4">Change pages</h1>
                <div className="flex space-x-2 mt-4">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={goToPreviousPage}
                    >
                        Back
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={goToNextPage}
                    >
                        Next
                    </button>
                </div>
                <div className="Example__container__document">
                    {file ? (
                        //@ts-ignore
                        <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
                            <Page key={`page_${page}`} pageNumber={page} />
                        </Document>
                    ) : (
                        // Render something else or provide a message when 'file' is null or undefined
                        <div>No file selected</div>
                    )}
                </div>
                <div className="mt-4 mb-4">
                    <input
                        type="text"
                        placeholder="RAG_API_KEY"
                        value={RagApiKey}
                        onChange={(e) => setRagApiKey(e.target.value)}
                        className="w-full border p-2"
                    />
                </div>
                <div className="mt-4 mb-4">
                    <input
                        type="text"
                        placeholder="OPENAI_KEY"
                        value={OpenaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        className="w-full border p-2"
                    />
                </div>
                <div className="mt-4 mb-4">
                    <input
                        type="text"
                        placeholder="Ask a question"
                        value={tempQuestion}
                        onChange={(e) => setTempQuestion(e.target.value)}
                        className="w-full border p-2"
                    />
                </div>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2 mb-4"
                    onClick={handleAskQuestion}
                >
                    Ask
                </button>
                <div className="text-white mt-4 mb-4">
                    <div>
                        <strong>Question:</strong>
                        <ul>
                            {questionHistory.map((q, index) => (
                                <li key={index}>{q}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-4">
                        <strong>Answer:</strong>
                        {isLoading ? (
                            <div role="status">
                                <svg aria-hidden="true"
                                     className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                     viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"/>
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"/>
                                </svg>
                                <span className="sr-only">Loading...</span>
                            </div>
                        ):(<p>{answer}</p>)}
                    </div>
                </div>
            </div>
        </div>
    );
}
