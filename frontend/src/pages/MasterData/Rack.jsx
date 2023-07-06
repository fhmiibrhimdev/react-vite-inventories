import axios from "axios";
import Swal from "sweetalert2";
import { debounce } from "lodash";
import Case from "../../components/Case";
import { useNavigate } from "react-router-dom";
import appConfig from "../../config/appConfig";
import withReactContent from "sweetalert2-react-content";
import React, { useEffect, useState, useCallback } from "react";
import InputValidation from "../Layout/Components/InputValidation";
import TextareaValidation from "../Layout/Components/TextareaValidation";
import Pagination from "../Layout/Components/Pagination";
import AddButton from "../Layout/Components/AddButton";
import SearchEntries from "../Layout/Components/SearchEntries";
import ModalFooter from "../Layout/Components/ModalFooter";
import ModalHeader from "../Layout/Components/ModalHeader";

export default function Rack() {
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRows, setTotalRows] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermDebounced, setSearchTermDebounced] = useState("");
    const [showing, setShowing] = useState(15);

    const [refetch, setRefetch] = useState(Math.random());
    const MySwal = withReactContent(Swal);

    useEffect(() => {
        document.title = "Rack";
        axios
            .get(
                `${appConfig.baseurlAPI}/rack?page=${currentPage}&per_page=${showing}&search=${searchTerm}&showing=${showing}`
            )
            .then((data) => {
                setRows(data.data.data.data);
                setTotalPages(data.data.data.last_page);
                setTotalRows(data.data.data.total);
                setIsLoading(false);
            })
            .catch((error) => {
                if (error.response.status === 403) {
                    navigate("/403");
                } else {
                    console.log(error);
                }
                setIsLoading(false);
            });
    }, [currentPage, showing, searchTermDebounced, refetch]);

    const [modalData, setModalData] = useState(null);
    const [isEditing, setIsEditing] = useState(null);

    /**
     * Initial form, reset input fields, and validate the form
     */

    const [formData, setFormData] = useState({
        rack_code: "",
        rack_name: "",
    });

    const initialFormData = {
        rack_code: "",
        rack_name: "",
    };

    const [formErrors, setFormErrors] = useState({
        rack_code: "",
        rack_name: "",
    });

    const validateForm = () => {
        let errors = {};
        let formIsValid = true;

        // Validate input rack_code
        if (!formData.rack_code) {
            formIsValid = false;
            errors.rack_code = "Rack Code is required";
        }

        // Validate input rack_name
        if (!formData.rack_name) {
            formIsValid = false;
            errors.rack_name = "Rack Name is required";
        }

        setFormErrors(errors);
        return formIsValid;
    };

    /**
     * Handle searching, pagination, and showing data
     */

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleSearchDebounced = useCallback(
        debounce((value) => {
            setSearchTermDebounced(value);
        }, appConfig.debounceTimeout),
        []
    );

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        handleSearchDebounced(value);
    };

    const handleShow = (event) => {
        setShowing(parseInt(event.target.value));
    };

    /**
     * Handle request
     */

    const handleAdd = () => {
        setModalData(null);
        setIsEditing(false);
        setFormData(initialFormData);
    };

    const handleEdit = (id) => {
        const data = rows.find((row) => row.id === id);
        setModalData(data);
        setFormData({
            rack_code: data.rack_code,
            rack_name: data.rack_name,
        });
        setIsEditing(true);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!isEditing) {
            if (validateForm()) {
                axios
                    .post(`${appConfig.baseurlAPI}/rack`, formData, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                    .then((response) => {
                        if (response.status === 201) {
                            Swal.fire({
                                title: "Success!",
                                text: "Data created successfully",
                                icon: "success",
                                timer: 1500,
                            }).then(() => {
                                $(".modal").modal("hide");
                                setRefetch(Math.random()); // refetch new data
                                setFormData(initialFormData); // set initial value for input
                            });
                        } else {
                            throw new Error("Network response was not ok");
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                        MySwal.fire({
                            title: "Oops...",
                            html: "Something went wrong.",
                            icon: "error",
                            timer: 2000,
                        });
                    });
            }
        } else {
            if (validateForm()) {
                axios
                    .put(
                        `${appConfig.baseurlAPI}/rack/${modalData.id}`,
                        formData,
                        {
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }
                    )
                    .then((response) => {
                        if (response.status === 200) {
                            Swal.fire({
                                title: "Success!",
                                text: "Data updated successfully",
                                icon: "success",
                                timer: 1500,
                            }).then(() => {
                                $(".modal").modal("hide");
                                setRefetch(Math.random()); // refetch new data
                                setFormData(initialFormData); // set initial value for input
                            });
                        } else {
                            throw new Error("Network response was not ok");
                        }
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                        MySwal.fire({
                            title: "Oops...",
                            html: "Something went wrong.",
                            icon: "error",
                            timer: 2000,
                        });
                    });
            }
        }
    };

    /**
     * Handle delete request
     */

    const handleConfirmationDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                handleDelete(id);
            }
        });
    };

    const handleDelete = (id) => {
        axios
            .delete(`${appConfig.baseurlAPI}/rack/${id}`)
            .then((data) => {
                console.log("Success:", data);
                setRows(rows.filter((row) => row.id !== id));
                setTotalRows(totalRows - 1);
                MySwal.fire({
                    title: "Successfully!",
                    html: "Data deleted succesfully.",
                    icon: "success",
                    timer: 1500,
                });
            })
            .catch((error) => {
                console.error("Error:", error);
                MySwal.fire({
                    title: "Oops...",
                    html: "Something went wrong.",
                    icon: "error",
                    timer: 2000,
                });
            });
    };

    if (isLoading) {
        return (
            <Case>
                <div className="section-header px-4 tw-rounded-none tw-shadow-md tw-shadow-gray-200 lg:tw-rounded-lg">
                    <h1 className="mb-1 tw-text-lg">Loading...</h1>
                </div>
            </Case>
        );
    }

    return (
        <Case>
            <div className="section-header px-4 tw-rounded-none tw-shadow-md tw-shadow-gray-200 lg:tw-rounded-lg">
                <h1 className="mb-1 tw-text-lg">Rack</h1>
            </div>

            <div className="section-body">
                <div className="card">
                    <div className="card-body px-0">
                        <h3>Table Rack</h3>
                        <SearchEntries
                            showing={showing}
                            handleShow={handleShow}
                            searchTerm={searchTerm}
                            handleSearch={handleSearch}
                        />
                        <div className="table-responsive tw-max-h-96">
                            <table>
                                <thead className="tw-sticky tw-top-0">
                                    <tr className="tw-text-gray-700">
                                        <th width="12%" className="text-center">
                                            No
                                        </th>
                                        <th>Rack Code</th>
                                        <th>Rack Name</th>
                                        <th className="text-center">
                                            <i className="fas fa-cog"></i>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(rows) && rows.length ? (
                                        rows.map((row, index) => (
                                            <tr key={index}>
                                                <td className="text-center">
                                                    {index + 1}
                                                </td>
                                                <td>{row.rack_code}</td>
                                                <td>{row.rack_name}</td>
                                                <td className="text-center">
                                                    <button
                                                        onClick={() =>
                                                            handleEdit(row.id)
                                                        }
                                                        className="btn btn-primary mr-2"
                                                        data-toggle="modal"
                                                        data-target="#formDataModal"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleConfirmationDelete(
                                                                row.id
                                                            )
                                                        }
                                                        className="btn btn-danger"
                                                    >
                                                        <i className="fas fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="text-center"
                                            >
                                                Not data available in the table
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination and showing data */}
                        <Pagination
                            currentPage={currentPage}
                            showing={showing}
                            totalRows={totalRows}
                            totalPages={totalPages}
                            handlePageChange={handlePageChange}
                        />
                        {/* Pagination and showing data */}
                    </div>
                </div>
                <AddButton handleAdd={handleAdd} />
            </div>

            <div
                className="modal fade"
                id="formDataModal"
                aria-labelledby="formDataModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog">
                    <div className="modal-content">
                        <ModalHeader isEditing={isEditing} />
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <InputValidation
                                    label="Rack Code"
                                    name="rack_code"
                                    type="text"
                                    value={formData.rack_code}
                                    onChange={handleInputChange}
                                    error={formErrors.rack_code}
                                />
                                <InputValidation
                                    label="Rack Name"
                                    name="rack_name"
                                    type="text"
                                    value={formData.rack_name}
                                    onChange={handleInputChange}
                                    error={formErrors.rack_name}
                                />
                            </div>
                            <ModalFooter />
                        </form>
                    </div>
                </div>
            </div>
        </Case>
    );
}
