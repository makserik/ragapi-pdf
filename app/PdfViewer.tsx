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


    const [tempQuestion, setTempQuestion] = useState<string>(''); // Temporary question storage

    // ... Other functions ...

    function handleAskQuestion() {
        console.log(tempQuestion)
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
                        value={tempQuestion}
                        onChange={(e) => setRagApiKey(e.target.value)}
                        className="w-full border p-2"
                    />
                </div>
                <div className="mt-4 mb-4">
                    <input
                        type="text"
                        placeholder="OPENAI_KEY"
                        value={tempQuestion}
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
                        <p>{answer}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
