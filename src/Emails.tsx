import React, { useState } from 'react';

interface EmailsProps {
    initialList: string;
    updateParent: (newValue: string) => void;
  }

export default function Emails({ initialList, updateParent }: EmailsProps) {
    const emailsRegex = /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?:,([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}))*$/;
    const [textA, setTextA] = useState(initialList);
    const [copyClass, setCopyClass] = useState((emailsRegex.test(initialList)) ? 'btn btn-outline-secondary' : 'btn btn-outline-secondary disabled');
    const [applyClass, setApplyClass] = useState((emailsRegex.test(initialList)) ? 'btn btn-primary' : 'btn btn-primary disabled');

    function handleChange(e: React.ChangeEvent<any>) {
        if (emailsRegex.test(e.target.value) && !e.target.value.endsWith(',')) {
            setCopyClass('btn btn-outline-secondary');
            setApplyClass('btn btn-primary');
        } else {
            setCopyClass('btn btn-outline-secondary disabled');
            setApplyClass('btn btn-primary disabled');
        }
        setTextA(e.target.value);
    }

    function copyURL() {
        navigator.clipboard.writeText(window.location.protocol + '//' + window.location.host + "?emails=" + textA);
    }

    function onClick() {
        updateParent(textA);
    }

    return (
        <div className="input-group">
            <span className="input-group-text">List of emails</span>
            <textarea className="form-control" id="emails" defaultValue={initialList} placeholder={'alice@' + process.env.REACT_APP_EMAIL_DOMAIN + ',bob@' + process.env.REACT_APP_EMAIL_DOMAIN} onChange={handleChange}></textarea>
            <button className={copyClass} type="button" id="copy" onClick={copyURL}>Copy URL with emails</button>
            <button className={applyClass} type="button" id="apply" onClick={onClick}>Apply</button>
        </div>
    );
}
