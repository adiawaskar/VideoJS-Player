import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [classCode, setClassCode] = useState("AKSO2X86D");  //default value: def. class code
    const [studentID, setStudentID] = useState("");  //969
    const [classID, setClassID] = useState("");  //685
    const [platform, setPlatform] = useState("windows");

    const [studentName, setStudentName] = useState("");
    const [studentEmail, setStudentEmail] = useState("");
    const [studentMobile, setStudentMobile] = useState("9768281478");

    return (
        <AppContext.Provider value={{
            classCode, setClassCode,
            studentID, setStudentID,
            classID, setClassID,
            platform, setPlatform,
            studentName, setStudentName,
            studentEmail, setStudentEmail,
            studentMobile, setStudentMobile,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
