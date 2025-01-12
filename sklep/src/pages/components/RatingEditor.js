import React, { useState } from "react";
import axios from "axios";
import "./style.css";

const RatingEditor = ({ rating, productId, isNew, onUpdate, onCancel }) => {
  const [editedRating, setEditedRating] = useState({
    rate: rating?.rate || 5,
    description: rating?.description || "",
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (isNew) {
        const response = await axios.post(
          "http://localhost:3004/ratings",
          {
            productId,
            ...editedRating,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 201) {
          onUpdate();
        }
      } else {
        console.log("Updating rating:", rating._id);
        const response = await axios.patch(
          "http://localhost:3004/ratings",
          {
            id: rating._id,
            ...editedRating,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200) {
          console.log("Rating updated successfully");
          onUpdate();
        }
      }
    } catch (err) {
      console.error("Error:", err.response?.data);
      setError(err.response?.data?.message || "Failed to save rating");
    }
  };

  return (
    <div className="rating-editor">
      <form onSubmit={handleSubmit}>
        <label>
          <b>Ocena:</b>
          <select
            style={{ width: "50px", borderRadius: "8px", marginLeft: "10px" }}
            value={editedRating.rate}
            onChange={(e) =>
              setEditedRating({ ...editedRating, rate: Number(e.target.value) })
            }
          >
            <option value="1">1</option>
            <option value="1.5">1.5</option>
            <option value="2">2</option>
            <option value="2.5">2.5</option>
            <option value="3">3</option>
            <option value="3.5">3.5</option>
            <option value="4">4</option>
            <option value="4.5">4.5</option>
            <option value="5">5</option>
          </select>
        </label>
        <div>
          <b>Opis:</b>
          <textarea
            value={editedRating.description}
            onChange={(e) =>
              setEditedRating({ ...editedRating, description: e.target.value })
            }
            placeholder={isNew ? "Dodaj opinię..." : "Zaktualizuj opinię..."}
          />
        </div>

        {error && <div className="error">{error}</div>}

        <div className="button-group">
          <button className="edit-button" type="submit">
            {isNew ? "Dodaj" : "Zapisz zmiany"}
          </button>
          <button className="edit-button" type="button" onClick={onCancel}>
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
};

export default RatingEditor;
