import React, { useState, useEffect, useCallback } from "react";
import RatingEditor from "./RatingEditor";
import axios from "axios";
import "./style.css";
import * as Icon from "react-bootstrap-icons";

const ProductRatings = ({ productId }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const currentUserId = localStorage.getItem("currentUser");

  const userRating = ratings.find((rating) => rating.userId === currentUserId);
  const hasUserRated = !!userRating;

  const fetchRatings = useCallback(async () => {
    try {
      const response = await axios.post(`http://localhost:3004/ratings/find`, {
        productId: productId,
      });
      if (response.data.message) {
        setRatings([]);
      } else {
        setRatings(response.data);
      }
    } catch (err) {
      setError("Błąd pobierania ocen produktu");
      setRatings([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      fetchRatings();
    }
  }, [productId, fetchRatings]);

  const handleDelete = async (ratingId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete("http://localhost:3004/ratings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: { id: ratingId },
      });
      fetchRatings();
    } catch (err) {
      console.error("Error deleting rating:", err);
      setError("Błąd usuwania opinii");
    }
  };

  if (loading) return <div className="loading">Ładowanie...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-ratings">
      <h1>Oceny produktu</h1>

      {!ratings || ratings.length === 0 ? (
        <h2 style={{ textAlign: "center" }}>Ten produkt nie ma jeszcze ocen</h2>
      ) : (
        ratings.map((rating) => (
          <div key={rating._id} className="rating">
            {isEditing === rating._id ? (
              <RatingEditor
                rating={rating}
                onUpdate={() => {
                  setIsEditing(null);
                  fetchRatings();
                }}
                onCancel={() => setIsEditing(null)}
              />
            ) : (
              <>
                <p>
                  <strong>Ocena:</strong> {rating.rate}
                </p>
                <p>
                  <strong>Opis:</strong> {rating.description}
                </p>
                <p>
                  <strong>Data:</strong>{" "}
                  {new Date(rating.date).toLocaleDateString()}
                </p>
                {rating.userId === currentUserId && (
                  <div className="rating-buttons">
                    <button
                      className="edit-button"
                      onClick={() => setIsEditing(rating._id)}
                    >
                      <Icon.Pencil
                        size={30}
                        style={{ marginRight: "10px", marginTop: "-5px" }}
                      />
                      Edytuj opinię
                    </button>
                    <button
                      className="edit-button"
                      onClick={() => handleDelete(rating._id)}
                    >
                      <Icon.Trash
                        size={30}
                        style={{ marginRight: "10px", marginTop: "-5px" }}
                      />
                      Usuń opinię
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))
      )}

      <div className="add-rating">
        {!hasUserRated && currentUserId && !isAdding && (
          <button
            className="add-rating-button"
            onClick={() => setIsAdding(true)}
          >
            <Icon.PlusSquare
              size={35}
              style={{ marginRight: "10px", marginTop: "-5px" }}
            />
            Dodaj opinię
          </button>
        )}

        {isAdding && (
          <RatingEditor
            isNew={true}
            productId={productId}
            onUpdate={() => {
              setIsAdding(false);
              fetchRatings();
            }}
            onCancel={() => setIsAdding(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ProductRatings;
