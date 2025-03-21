import React from "react";

interface CreditTHProps {
    content: String;
    className?: String;
}

const CreditTH: React.FC<CreditTHProps> = ({ content, className }) => {
    return (
        <th className={className + `border-gray-300 dark:border-gray-700 border border-b-2 text-center p-2 text-sm font-normal text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-950`} >
            {content}
        </th>
    )
}

export default CreditTH