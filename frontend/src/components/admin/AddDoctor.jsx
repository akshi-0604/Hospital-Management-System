import { useState } from "react";
import axios from "axios";
import "./AddDoctor.css";

function AddDoctor({ onDoctorAdded, onCancel }) {

    const [formData, setFormData] = useState({
        fullName: "",
        doctorId: "",
        email: "",
        phone: "",
        password: "",
        specialization: "",
        department: "",
        experience: "",
        qualification: "",
        consultationFee: "",
        gender: "",
        dob: "",
        joiningDate: "",
        status: "Available",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");


    function handleChange(event) {

        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    }


    async function handleSubmit(event) {

        event.preventDefault();

        setError("");
        setSuccess("");

        try {

            setLoading(true);

            const response = await axios.post(
                "http://https://hospital-management-system-nvjt.onrender.com/api/doctors",
                formData
            );

            console.log(
                "Doctor added successfully:",
                response.data
            );

            setSuccess("Doctor added successfully.");

            /*
              Wait a little so the admin can see
              the success message.
            */
            setTimeout(() => {

                if (onDoctorAdded) {
                    onDoctorAdded();
                }

            }, 800);

        } catch (error) {

            console.error(
                "Add doctor error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Something went wrong while adding the doctor."
            );

        } finally {

            setLoading(false);

        }
    }


    function handleCancel() {

        if (onCancel) {
            onCancel();
        }

    }


    return (
        <div className="add-doctor-page">

            <div className="add-doctor-header">

                <div>
                    <h2>Add Doctor</h2>

                    <p>
                        Add a new doctor to the hospital system.
                    </p>
                </div>

            </div>


            <div className="add-doctor-card">

                <form onSubmit={handleSubmit}>

                    {/* Basic Information */}

                    <div className="form-section">

                        <h3>
                            Basic Information
                        </h3>


                        <div className="form-grid">

                            <div className="form-group">

                                <label>
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    placeholder="Enter full name"
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Doctor ID
                                </label>

                                <input
                                    type="text"
                                    name="doctorId"
                                    value={formData.doctorId}
                                    placeholder="Enter doctor ID"
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    placeholder="Enter email"
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Phone Number
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    placeholder="Enter phone number"
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    placeholder="Create password"
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select gender
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            <div className="form-group">

                                <label>
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Joining Date
                                </label>

                                <input
                                    type="date"
                                    name="joiningDate"
                                    value={formData.joiningDate}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                    </div>


                    {/* Professional Information */}

                    <div className="form-section">

                        <h3>
                            Professional Information
                        </h3>


                        <div className="form-grid">

                            <div className="form-group">

                                <label>
                                    Specialization
                                </label>

                                <input
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    placeholder="Example: Cardiologist"
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Department
                                </label>

                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    placeholder="Example: Cardiology"
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Experience
                                </label>

                                <input
                                    type="number"
                                    name="experience"
                                    value={formData.experience}
                                    placeholder="Years of experience"
                                    min="0"
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Qualification
                                </label>

                                <input
                                    type="text"
                                    name="qualification"
                                    value={formData.qualification}
                                    placeholder="Example: MBBS, MD"
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Consultation Fee
                                </label>

                                <input
                                    type="number"
                                    name="consultationFee"
                                    value={formData.consultationFee}
                                    placeholder="Enter consultation fee"
                                    min="0"
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            <div className="form-group">

                                <label>
                                    Status
                                </label>

                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Available">
                                        Available
                                    </option>

                                    <option value="On Leave">
                                        On Leave
                                    </option>

                                    <option value="Inactive">
                                        Inactive
                                    </option>
                                </select>

                            </div>

                        </div>

                    </div>


                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}


                    {success && (
                        <div className="success-message">
                            {success}
                        </div>
                    )}


                    {/* Buttons */}

                    <div className="add-doctor-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>


                        <button
                            type="submit"
                            className="save-doctor-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Adding Doctor..."
                                : "Add Doctor"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

export default AddDoctor;