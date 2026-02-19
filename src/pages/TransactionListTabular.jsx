import React from 'react';
import dayjs from 'dayjs';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/transaction/transactionListTabular.large.css';
import '../css/transaction/transactionListTabular.handheld.css';

const TransactionListTabular = ({
    loading,
    transactions,
    handleViewTransaction,
    totalDebit,
    totalCredit,
}) => (
    <div className="results-section responsive-transaction-list">
        <ToastContainer />
        {loading ? (
            <div className="loading-indicator">Loading transactions...</div>
        ) : transactions.length > 0 ? (
            <div className="table-container">
                <h3>
                    Transactions Found ({transactions.length})  |  Total Debit - ₹{totalDebit}  |  Total Credit - ₹{totalCredit}
                </h3>
                <div className="scrollable-table-wrapper">
                    <table className="transaction-table">
                        <thead>
                            <tr>
                                <th>Category (Type)</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Room</th>
                                <th>Booking Customer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction, index) => (
                                <tr
                                    key={index}
                                    className={`transaction-row ${transaction.acc_category_type}`}
                                    onClick={() => handleViewTransaction(transaction)}
                                    style={{
                                        background:
                                            transaction.acc_category_type === 'credit'
                                                ? '#e3f2fd'
                                                : '#ffe0b2',
                                        border: `2px solid ${transaction.acc_category_type === 'credit'
                                            ? '#1976d2'
                                            : '#e65100'
                                            }`
                                    }}
                                >
                                    <td>
                                        {transaction.acc_category_name} ({transaction.payment_type})
                                    </td>
                                    <td>
                                        ₹{Number(transaction.acc_entry_amount.toFixed(2)).toLocaleString()}
                                    </td>
                                    <td>
                                        {dayjs(transaction.acc_entry_date, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                                    </td>
                                    <td>{transaction.paid_by_customer_name}</td>
                                    <td>{transaction.received_by_customer_name}</td>
                                    <td>
                                        {transaction.received_for_booking_id !== null
                                            ? transaction.room_name
                                            : ''}
                                    </td>
                                    <td>
                                        {transaction.received_for_booking_id !== null
                                            ? transaction.booking_customer_name
                                            : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="no-results">No Transactions found. Try adjusting your search criteria.</div>
        )}
    </div>
);

export default TransactionListTabular;