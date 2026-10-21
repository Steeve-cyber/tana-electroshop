import { useEffect, useState } from "react";
import Icon from "./Icon";

function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(value);
}

export default function Cart({
  cart,
  isOpen,
  subtotal,
  discountAmount,
  deliveryFee,
  total,
  discountCode,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onApplyPromo,
  onRemovePromo,
  onCheckout,
  onShopClick
}) {
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const shippingGap = Math.max(0, 150 - subtotal);
  const handlePromo = (event) => {
    event.preventDefault();
    const accepted = onApplyPromo(promoInput.trim());
    setPromoMessage(accepted ? "Code appliqué : −10 % sur votre sélection." : "Ce code n’est pas reconnu.");
  };

  return (
    <div className="cart-layer">
      <button className="cart-backdrop" type="button" onClick={onClose} aria-label="Fermer le panier" />
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="cart-drawer__header">
          <div>
            <p className="eyebrow">Votre sélection</p>
            <h2 id="cart-title">Mon panier <span>{itemCount}</span></h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Fermer le panier">
            <Icon name="close" size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty__icon"><Icon name="bag" size={29} /></span>
            <h3>Votre panier attend sa première trouvaille.</h3>
            <p>Parcourez la sélection et ajoutez vos essentiels tech.</p>
            <button className="button button--dark" type="button" onClick={onShopClick}>
              Explorer la sélection <Icon name="arrow" size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className="cart-shipping">
              <div className="cart-shipping__message">
                <Icon name="truck" size={18} />
                {shippingGap > 0
                  ? <>Plus que <strong>{formatPrice(shippingGap)}</strong> pour la livraison offerte.</>
                  : <strong>La livraison est offerte sur votre commande.</strong>}
              </div>
              <div className="shipping-progress" aria-label="Progression vers la livraison offerte">
                <span style={{ width: Math.min(100, subtotal / 150 * 100) + "%" }} />
              </div>
            </div>

            <div className="cart-items">
              {cart.map((item) => (
                <article className="cart-item" key={item.id}>
                  <img
                    src={item.image}
                    alt=""
                    onError={(event) => { event.currentTarget.src = "/product-placeholder.svg"; }}
                  />
                  <div className="cart-item__main">
                    <div className="cart-item__title-row">
                      <div>
                        <span className="cart-item__category">{item.category}</span>
                        <h3>{item.title}</h3>
                      </div>
                      <button className="remove-item" type="button" onClick={() => onRemoveItem(item.id)} aria-label={"Supprimer " + item.title}>
                        <Icon name="trash" size={16} />
                      </button>
                    </div>
                    <div className="cart-item__bottom">
                      <div className="quantity-control" aria-label={"Quantité : " + item.quantity}>
                        <button type="button" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} aria-label="Diminuer la quantité">
                          <Icon name="minus" size={13} />
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" disabled={item.quantity >= item.stock} onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} aria-label="Augmenter la quantité">
                          <Icon name="plus" size={13} />
                        </button>
                      </div>
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-summary">
              <form className="promo-form" onSubmit={handlePromo}>
                <label htmlFor="promo-code">Vous avez un code de bienvenue ?</label>
                <div className="promo-form__controls">
                  <input
                    id="promo-code"
                    value={promoInput}
                    onChange={(event) => setPromoInput(event.target.value)}
                    placeholder="Ex. TANA10"
                    disabled={Boolean(discountCode)}
                  />
                  {discountCode ? (
                    <button type="button" onClick={() => { onRemovePromo(); setPromoMessage(""); }}>Retirer</button>
                  ) : (
                    <button type="submit">Appliquer</button>
                  )}
                </div>
                {promoMessage && !discountCode && <p className="promo-message">{promoMessage}</p>}
                {discountCode && <p className="promo-message is-success">Code TANA10 actif · −10 %</p>}
              </form>
              <div className="summary-line"><span>Sous-total</span><span>{formatPrice(subtotal)}</span></div>
              {discountAmount > 0 && <div className="summary-line summary-line--discount"><span>Réduction</span><span>−{formatPrice(discountAmount)}</span></div>}
              <div className="summary-line"><span>Livraison</span><span>{deliveryFee === 0 ? "Offerte" : formatPrice(deliveryFee)}</span></div>
              <div className="summary-total"><span>Total estimé</span><strong>{formatPrice(total)}</strong></div>
              <p className="tax-note">TVA incluse · frais de livraison calculés à titre indicatif</p>
              <button className="button button--dark button--full checkout-button" type="button" onClick={onCheckout}>
                Passer à la commande <Icon name="arrow" size={17} />
              </button>
              <button className="clear-cart" type="button" onClick={onClearCart}>Vider le panier</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}


