import axios, { Axios } from "axios";
import Swal from "sweetalert2";
import Select from "react-select";
import { debounce, difference } from "lodash";
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

export default function StockOpname() {
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [items, setItems] = useState([]);

    const [selectedItems, setSelectedItems] = useState([]);

    const [isLoading, setIsLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRows, setTotalRows] = useState(0);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermDebounced, setSearchTermDebounced] = useState("");
    const [showing, setShowing] = useState(10);

    const [refetch, setRefetch] = useState(Math.random());
    const MySwal = withReactContent(Swal);

    useEffect(() => {
        document.title = "Inventories - Stock Opname";
        axios
            .get(
                `${appConfig.baseurlAPI}/stock-opname?page=${currentPage}&per_page=${showing}&search=${searchTerm}&showing=${showing}`
            )
            .then((data) => {
                setRows(data.data.data.data);
                setItems(data.data.items);
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

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 7);
    const formattedDate = currentDate.toISOString().slice(0, 16);

    /**
     * Initial form, reset input fields, and validate the form
     */

    const [formData, setFormData] = useState({
        date: formattedDate,
        item_id: "",
        qty: "0",
        book: "",
        physical: "",
        difference: "",
        description: "[Opname] ",
    });

    const initialFormData = {
        date: formattedDate,
        item_id: "",
        qty: "0",
        book: "0",
        physical: "0",
        difference: "0",
        description: "[Opname] ",
    };

    const [formErrors, setFormErrors] = useState({
        item_id: "",
        book: "",
        physical: "",
        description: "",
    });

    const validateForm = () => {
        let errors = {};
        let formIsValid = true;

        // Validate input date
        if (!formData.date) {
            formIsValid = false;
            errors.date = "Date is required";
        }

        // Validate input item_id
        if (!formData.item_id) {
            formIsValid = false;
            errors.item_id = "Item name is required";
        }

        // Validate input book
        if (!formData.book) {
            formIsValid = false;
            errors.book = "Book is required";
        } else if (!/^\d+(\.\d{1,2})?$/.test(formData.book)) {
            formIsValid = false;
            errors.book = "Book is invalid must be number";
        }

        if (!formData.physical) {
            formIsValid = false;
            errors.physical = "Physical is required";
        } else if (!/^\d+(\.\d{1,2})?$/.test(formData.physical)) {
            formIsValid = false;
            errors.physical = "Physical is invalid must be number";
        }

        // Validate input description
        if (!formData.description) {
            formIsValid = false;
            errors.description = "Description is required";
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

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name == "physical") {
            setFormData({
                ...formData,
                difference: value - formData.book,
                physical: value,
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSelectedChange = (value) => {
        axios
            .get(`${appConfig.baseurlAPI}/stock-opname/${value.value}/book`)
            .then((response) => {
                setFormData({
                    ...formData,
                    book: response.data.value_book,
                    difference: formData.physical - response.data.value_book,
                    item_id: value.value,
                });
            });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!isEditing) {
            if (validateForm()) {
                axios
                    .post(`${appConfig.baseurlAPI}/stock-opname`, formData, {
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
                        `${appConfig.baseurlAPI}/stock-opname/${modalData.id}`,
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
            .delete(`${appConfig.baseurlAPI}/stock-opname/${id}`)
            .then((data) => {
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
                <h1 className="mb-1 tw-text-lg">Stock Opname</h1>
            </div>

            <div className="section-body">
                <div className="card">
                    <div className="card-body px-0">
                        <h3>Table Stock Opname</h3>
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
                                        <th width="8%" className="text-center">
                                            No
                                        </th>
                                        <th width="11%">Date</th>
                                        <th width="20%">Item name</th>
                                        <th width="8%">Book</th>
                                        <th width="10%">Physical</th>
                                        <th width="12%">Difference</th>
                                        <th width="20%">Description</th>
                                        <th width="8%" className="text-center">
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
                                                <td>{row.date}</td>
                                                <td>{row.item_name}</td>
                                                <td>{row.book},00</td>
                                                <td>{row.physical},00</td>
                                                <td>{row.difference},00</td>
                                                <td>{row.description}</td>
                                                <td className="text-center">
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
                                                colSpan="8"
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
                                    label="Date"
                                    name="date"
                                    type="datetime-local"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    error={formErrors.date}
                                />
                                <div className="form-group">
                                    <label htmlFor="item_id">Item name</label>
                                    <Select
                                        id="item_id"
                                        name="item_id"
                                        options={items}
                                        onChange={handleSelectedChange}
                                    />
                                    {formErrors.item_id && (
                                        <span className="tw-text-xs tw-text-red-500">
                                            {formErrors.item_id}
                                        </span>
                                    )}
                                </div>
                                <div className="row">
                                    <div className="col-lg-4">
                                        <InputValidation
                                            label="Book"
                                            name="book"
                                            type="number"
                                            value={formData.book}
                                            onChange={handleInputChange}
                                            error={formErrors.book}
                                        />
                                    </div>
                                    <div className="col-lg-4">
                                        <InputValidation
                                            label="Physical"
                                            name="physical"
                                            type="number"
                                            value={formData.physical}
                                            onChange={handleInputChange}
                                            error={formErrors.physical}
                                        />
                                    </div>
                                    <div className="col-lg-4">
                                        <InputValidation
                                            label="Difference"
                                            name="difference"
                                            type="number"
                                            value={formData.difference}
                                            onChange={handleInputChange}
                                            error={formErrors.difference}
                                        />
                                    </div>
                                </div>
                                <TextareaValidation
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    error={formErrors.description}
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
