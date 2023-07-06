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

export default function Item() {
    const navigate = useNavigate();

    const [rows, setRows] = useState([]);
    const [categories, setCategories] = useState([]);
    const [racks, setRacks] = useState([]);
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
        document.title = "Item";
        axios
            .get(
                `${appConfig.baseurlAPI}/item?page=${currentPage}&per_page=${showing}&search=${searchTerm}&showing=${showing}`
            )
            .then((data) => {
                setCategories(data.data.categories);
                setRacks(data.data.racks);
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
        image: null,
        item_code: "",
        item_name: "",
        category_id: "",
        rack_id: "",
        description: "",
    });

    const initialFormData = {
        image: null,
        item_code: "",
        item_name: "",
        category_id: "",
        rack_id: "",
        description: "",
    };

    const [formErrors, setFormErrors] = useState({
        image: null,
        item_code: "",
        item_name: "",
        category_id: "",
        rack_id: "",
        description: "",
    });

    const validateForm = () => {
        let errors = {};
        let formIsValid = true;

        // Validate input item_code
        if (!formData.item_code) {
            formIsValid = false;
            errors.item_code = "Item Code is required";
        }

        // Validate input item_name
        if (!formData.item_name) {
            formIsValid = false;
            errors.item_name = "Item Name is required";
        }

        // Validate input category_id
        if (!formData.category_id) {
            formIsValid = false;
            errors.category_id = "Category is required";
        }

        // Validate input rack_id
        if (!formData.rack_id) {
            formIsValid = false;
            errors.rack_id = "Rack is required";
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

    const handleEdit = (id) => {
        const data = rows.find((row) => row.id === id);
        console.log(data);
        setModalData(data);
        setFormData({
            image: null,
            item_code: data.item_code,
            item_name: data.item_name,
            category_id: data.category_id,
            rack_id: data.rack_id,
            description: data.description,
            stock: data.stock,
        });
        setIsEditing(true);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (event) => {
        setFormData({ ...formData, image: event.target.files[0] });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!isEditing) {
            if (validateForm()) {
                axios
                    .post(`${appConfig.baseurlAPI}/item`, formData, {
                        headers: {
                            "Content-Type": "multipart/form-data",
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
                const data = new FormData();
                data.append("image", formData.image);
                data.append("item_code", formData.item_code);
                data.append("item_name", formData.item_name);
                data.append("category_id", formData.category_id);
                data.append("rack_id", formData.rack_id);
                data.append("description", formData.description);
                data.append("_method", "put");
                axios
                    .post(
                        `${appConfig.baseurlAPI}/item/${modalData.id}`,
                        data,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
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
            .delete(`${appConfig.baseurlAPI}/item/${id}`)
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
                <h1 className="mb-1 tw-text-lg">Item</h1>
            </div>

            <div className="section-body">
                <div className="card">
                    <div className="card-body px-0">
                        <h3>Table Item</h3>
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
                                        <th width="8%">Image</th>
                                        <th width="10%">Item Code</th>
                                        <th width="10%">Item Name</th>
                                        <th width="10%">Category</th>
                                        <th>Rack</th>
                                        <th width="8%">Stock</th>
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
                                                <td>
                                                    <img
                                                        className="tw-aspect-square tw-w-3/6 tw-rounded-lg"
                                                        src={
                                                            appConfig.baseURL +
                                                            "/storage/images/" +
                                                            row.image
                                                        }
                                                    />
                                                </td>
                                                <td>{row.item_code}</td>
                                                <td>{row.item_name}</td>
                                                <td>{row.category_name}</td>
                                                <td>
                                                    {row.rack_code} -{" "}
                                                    {row.rack_name}
                                                </td>
                                                <td>{row.stock},00 </td>
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
                                                colSpan="9"
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
                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                        >
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="image">Image</label>
                                    <input
                                        type="file"
                                        name="image"
                                        id="image"
                                        className="form-control"
                                        onChange={handleFileChange}
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-lg-6">
                                        <InputValidation
                                            label="Item Code"
                                            name="item_code"
                                            type="text"
                                            value={formData.item_code}
                                            onChange={handleInputChange}
                                            error={formErrors.item_code}
                                        />
                                    </div>
                                    <div className="col-lg-6">
                                        <InputValidation
                                            label="Item Name"
                                            name="item_name"
                                            type="text"
                                            value={formData.item_name}
                                            onChange={handleInputChange}
                                            error={formErrors.item_name}
                                        />
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="form-group">
                                            <label htmlFor="category_id">
                                                Category
                                            </label>
                                            <select
                                                name="category_id"
                                                id="category_id"
                                                className={`form-control ${
                                                    formErrors.category_id
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                value={
                                                    formData.category_id || ""
                                                }
                                                onChange={handleInputChange}
                                            >
                                                <option value="">
                                                    -- Select Option --
                                                </option>
                                                {categories.map((cat) => (
                                                    <option
                                                        key={cat.id}
                                                        value={cat.id}
                                                    >
                                                        {cat.category_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {formErrors.category_id && (
                                                <div className="invalid-feedback">
                                                    {formErrors.category_id}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="form-group">
                                            <label htmlFor="rack_id">
                                                Rack
                                            </label>
                                            <select
                                                name="rack_id"
                                                id="rack_id"
                                                className={`form-control ${
                                                    formErrors.rack_id
                                                        ? "is-invalid"
                                                        : ""
                                                }`}
                                                value={formData.rack_id || ""}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">
                                                    -- Select Option --
                                                </option>
                                                {racks.map((rack) => (
                                                    <option
                                                        key={rack.id}
                                                        value={rack.id}
                                                    >
                                                        {rack.rack_code} -{" "}
                                                        {rack.rack_name}
                                                    </option>
                                                ))}
                                            </select>
                                            {formErrors.rack_id && (
                                                <div className="invalid-feedback">
                                                    {formErrors.rack_id}
                                                </div>
                                            )}
                                        </div>
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
