import React from 'react';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/transactionList.large.css';
import '../css/transactionList.handheld.css';

const TransactionList = ({
    loading,
    expenses,
    paginatedExpenses,
    itemsPerPage,
    currentPage,
    handlePageChange,
    handleViewExpense,
    totalDebit,
    totalCredit,
}) => (
    <div className="results-section responsive-transaction-list">
        <ToastContainer />
        {loading ? (
            <div className="loading-indicator">Loading transactions...</div>
        ) : expenses.length > 0 ? (
            <div className="table-container">
                <h3>
                    Transactions Found ({expenses.length})  |  Total Debit - ₹{totalDebit}  |  Total Credit - ₹{totalCredit}
                </h3>
                <div className="card-list">
                    {paginatedExpenses.map((expense, index) => (
                        <div
                            key={index}
                            className="transaction-card"
                            onClick={() => handleViewExpense(expense)}
                            style={{
                                background:
                                    expense.acc_category_type === 'credit'
                                        ? '#e3f2fd' // Light blue
                                        : '#ffe0b2', // Light orange
                                border: `2px solid ${expense.acc_category_type === 'credit'
                                    ? '#1976d2'
                                    : '#e65100'
                                    }`
                            }}
                        >
                            <div className="card-row">
                                <span className="card-label">
                                    {expense.acc_category_name} ({expense.payment_type})
                                </span>
                            </div>
                            <div className="card-row">
                                <span className="card-label">₹{Number(expense.acc_entry_amount.toFixed(2)).toLocaleString()}&nbsp;on</span>
                                <span className="card-value">&nbsp;{new dayjs(expense.acc_entry_date, 'YYYY-MM-DD').format('MMM DD, YYYY')}</span>
                            </div>
                            <div className="card-row">
                                <span className="card-label">From:&nbsp;</span>
                                <span className="card-value">{expense.paid_by_customer_name}&nbsp;</span>
                            </div>
                            <div className="card-row">
                                <span className="card-label">To:&nbsp;</span>
                                <span className="card-value">{expense.received_by_customer_name}&nbsp;</span>
                            </div>
                            {expense.received_for_booking_id !== null && (
                                <div className="card-row">
                                    <span className="card-label">{expense.room_name} -&nbsp;</span>
                                    <span className="card-value">{expense.booking_customer_name}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                {expenses.length > itemsPerPage && (
                    <div className="pagination">
                        <button
                            className="pagination-button"
                            onClick={() => handlePageChange('prev')}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="page-info">
                            Page {currentPage} of {Math.ceil(expenses.length / itemsPerPage)}
                        </span>
                        <button
                            className="pagination-button"
                            onClick={() => handlePageChange('next')}
                            disabled={currentPage * itemsPerPage >= expenses.length}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        ) : (
            <div className="no-results">No Transactions found. Try adjusting your search criteria.</div>
        )}
    </div>
);

export default TransactionList;