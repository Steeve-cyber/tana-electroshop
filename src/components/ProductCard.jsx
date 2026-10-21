import Icon from "./Icon";

function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(value);
}

export default function ProductCard({ product, isFavorite, onToggleFavorite, onAddToCart, onQuickView }) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <article className="product-card">
      <div className="product-card__visual">
        <button
          className="product-card__image-button"
          type="button"
          onClick={() => onQuickView(product)}
          aria-label={"Voir les détails de " + product.title}
        >
          <img
            className="product-card__image"
            src={product.image}
            alt={product.title}
            loading="lazy"
            onError={(event) => { event.currentTarget.src = "/product-placeholder.svg"; }}
          />
        </button>
        {product.badge && (
          <span className={"product-badge" + (product.isNew ? " product-badge--new" : "")}>
            {product.badge}
          </span>
        )}
        {discount && <span className="product-discount">−{discount} %</span>}
        <button
          className={"favorite-button" + (isFavorite ? " is-active" : "")}
          type="button"
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={isFavorite}
          onClick={() => onToggleFavorite(product.id)}
        >
          <Icon name="heart" size={18} />
        </button>
        <button className="quick-view-button" type="button" onClick={() => onQuickView(product)}>
          <Icon name="eye" size={16} />
          <span>Aperçu rapide</span>
        </button>
      </div>
      <div className="product-card__content">
        <div className="product-card__meta">
          <span>{product.category}</span>
          <span className="rating"><Icon name="star" size={14} /> {product.rating.toFixed(1)}</span>
        </div>
        <button className="product-card__title" type="button" onClick={() => onQuickView(product)}>
          {product.title}
        </button>
        <p className="product-card__description">{product.description}</p>
        <div className="product-card__bottom">
          <div className="price-group">
            <strong>{formatPrice(product.price)}</strong>
            {product.originalPrice && <del>{formatPrice(product.originalPrice)}</del>}
          </div>
          <button
            className="add-button"
            type="button"
            onClick={() => onAddToCart(product)}
            aria-label={"Ajouter " + product.title + " au panier"}
          >
            <Icon name="bag" size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}
