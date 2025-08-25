import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { uploadToDrive } from '../modules/booking.module';

import '../css/document.large.css';
import '../css/document.handheld.css';

const Documents = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [documents, setDocuments] = useState([]);
    const [users, setUsers] = useState([]);
    const [booking, setBooking] = useState(null);
    const [showIdentityAttachment, setShowIdentityAttachment] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFormDisabled, setIsFormDisabled] = useState(false);

    useEffect(() => {
        if (location.state?.booking) {
            setBooking(location.state?.booking);
            setDocuments(location.state?.booking.attachments || []);
        }
    }, [location.state]);

    const handleAdd = () => {
        setShowIdentityAttachment(true);
    };

    const handleUpload = async () => {
        // Upload file if one was selected
        if (uploadedFile) {
            try {
                setIsSubmitting(true);
                setIsFormDisabled(true); // Disable on submit
                toast.info('Uploading file...');
                // get the folder_id from the array if there are atleast one Element
                let parentFolderID = -999;
                if (booking.attachments && booking.attachments.length > 0) {
                    parentFolderID = booking.attachments[0].folder_id;
                }

                const resp = await uploadToDrive(uploadedFile, booking.booking_id, parentFolderID);
                const createdAttachment = [...documents, {
                    file_content: `https://drive.google.com/uc?id=${resp.id}&export=download`,
                    file_id: resp.id,
                    file_name: resp.name,
                    file_size: NaN,
                    file_type: resp.mimeType,
                    file_url: `https://drive.google.com/file/d/${resp.id}/view?usp=drivesdk`,
                    folder_id: resp.parent_folder_id
                }]
                setBooking({
                    ...booking,
                    attachments: createdAttachment
                })
                setDocuments(createdAttachment);
                setShowIdentityAttachment(false);
                setUploadedFile(null);
                toast.success('File uploaded successfully!');
            } catch (error) {
                console.error('Booking:: Error uploading file:', error);
                toast.error('Failed to upload Identity Document. Please try again.');
                throw error;
            } finally {
                setIsSubmitting(false);
                setIsFormDisabled(false); // Re-enable on error
            }
        }
    }

    const handleDelete = async (payment) => {
    };

    const handleCancel = () => {
        navigate(location.state?.returnTo || '/booking/', {
            state: {
                ...location.state,
                preloadedBooking: booking
            }
        });
    };

    return (
        <div className="document-form-container">
            <ToastContainer />
            <h2>Documents for Booking #{booking?.booking_id}</h2>
            <div className="documents-list">
                <fieldset >
                    <legend>&nbsp;Attachments&nbsp;</legend>
                    {(booking?.attachments || []).map((attachment, index) => (
                        <div key={index} className="document-item">
                            <div className="form-group">
                                <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">{attachment.file_name}</a>
                            </div>
                        </div>
                    ))}
                    <fieldset>
                        <div className="form-buttons">
                            <button onClick={handleAdd} disabled={isFormDisabled} className="btn-add">Add Document</button>
                            <button onClick={handleCancel} disabled={isFormDisabled} className="btn-cancel">Cancel</button>
                        </div>
                    </fieldset>
                </fieldset>
                {showIdentityAttachment && (
                    <fieldset>
                        <div className='form-group'>
                            <input className='form-input'
                                type="file"
                                onChange={(e) => setUploadedFile(e.target.files[0])}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                            {uploadedFile && (
                                <button onClick={handleUpload} disabled={isFormDisabled}>Upload</button>
                            )}
                        </div>
                    </fieldset>
                )}
            </div>
        </div>
    );
};

export default Documents;