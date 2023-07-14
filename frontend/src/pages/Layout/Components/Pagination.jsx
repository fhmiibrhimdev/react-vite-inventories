import React, { Component } from "react";

export default function Pagination({
    currentPage,
    showing,
    totalRows,
    totalPages,
    handlePageChange,
}) {
    const renderPageNumbers = () => {
        const pageNumbers = [];
        const visiblePages = 3; // Jumlah halaman yang terlihat sebelum dan sesudah halaman saat ini

        if (totalPages <= 2 + visiblePages * 2) {
            // Jika total halaman <= jumlah halaman yang terlihat * 2 + 2 (prev & next)
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else if (currentPage <= visiblePages + 1) {
            // Jika halaman saat ini berada di awal (1, 2, 3, ...)
            for (let i = 1; i <= visiblePages * 2 + 1; i++) {
                pageNumbers.push(i);
            }
            pageNumbers.push("...");
            pageNumbers.push(totalPages);
        } else if (currentPage >= totalPages - visiblePages) {
            // Jika halaman saat ini berada di akhir (..., 19, 20, 21)
            pageNumbers.push(1);
            pageNumbers.push("...");
            for (let i = totalPages - visiblePages * 2; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Jika halaman saat ini berada di tengah-tengah (..., 6, 7, 8, 9, ...)
            pageNumbers.push(1);
            pageNumbers.push("...");
            for (
                let i = currentPage - visiblePages;
                i <= currentPage + visiblePages;
                i++
            ) {
                pageNumbers.push(i);
            }
            pageNumbers.push("...");
            pageNumbers.push(totalPages);
        }

        return pageNumbers.map((number, index) => {
            if (number === "...") {
                return (
                    <li key={index} className="page-item disabled">
                        <span className="page-link">...</span>
                    </li>
                );
            } else {
                return (
                    <li
                        key={index}
                        className={`page-item ${
                            number === currentPage ? "active" : ""
                        }`}
                    >
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(number)}
                        >
                            {number}
                        </button>
                    </li>
                );
            }
        });
    };

    return (
        <div className="mt-4 p-3 table-responsive tw-block tw-justify-center lg:tw-flex lg:tw-justify-between">
            <div className="tw-mb-5 tw-text-center lg:tw-mb-0">
                Showing {(currentPage - 1) * showing + 1} to{" "}
                {Math.min(currentPage * showing, totalRows)} of {totalRows}{" "}
                results
            </div>
            <div>
                <ul className="pagination">
                    <li
                        className={`page-item ${
                            currentPage === 1 ? "disabled" : ""
                        }`}
                    >
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Prev
                        </button>
                    </li>
                    {renderPageNumbers()}
                    <li
                        className={`page-item ${
                            currentPage === totalPages ? "disabled" : ""
                        }`}
                    >
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
}
