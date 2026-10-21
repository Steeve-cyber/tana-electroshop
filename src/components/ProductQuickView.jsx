import { useEffect, useRef } from "react";
import Icon from "./Icon";

function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(value);
}

export default function ProductQuickView({ product, isFavorite, onToggleFavorite, onAddToCart, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!product) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="quick-view" role="dialog" aria-modal="true" aria-labelledby="quick-view-title">
        <button ref={closeRef} className="modal-close" type="button" onClick={onClose} aria-label="Fermer">
          <Icon name="close" />
        </button>
        <div className="quick-view__image-wrap">
          <img
            src={product.image}
            alt={product.title}
            onError={(event) => { event.currentTarget.src = "/product-placeholder.svg"; }}
          />
          {product.badge && <span className="product-badge product-badge--new">{product.badge}</span>}
        </div>
        <div className="quick-view__body">
          <p className="eyebrow">{product.category} · Sélection Tana</p>
          <div className="rating quick-view__rating"><Icon name="star" size={15} /> {product.rating.toFixed(1)} <span>({product.reviews} avis)</span></div>
          <h2 id="quick-view-title">{product.title}</h2>
          <p className="quick-view__description">{product.description}</p>
          <ul className="feature-list">
            {product.features.map((feature) => (
              <li key={feature}><Icon name="check" size={16} />{feature}</li>
            ))}
          </ul>
          <div className="quick-view__stock">
            <span className="stock-dot" />
            {product.stock > 5 ? "En stock, prêt à être ajouté" : "Plus que " + product.stock + " disponibles"}
          </div>
          <div className="quick-view__footer">
            <strong>{formatPrice(product.price)}</strong>
            <button
              className={"favorite-button favorite-button--large" + (isFavorite ? " is-active" : "")}
              type="button"
              aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              aria-pressed={isFavorite}
              onClick={() => onToggleFavorite(product.id)}
            >
              <Icon name="heart" size={19} />
            </button>
            <button className="button button--dark" type="button" onClick={() => onAddToCart(product)}>
              <Icon name="bag" size={17} /> Ajouter au panier
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
