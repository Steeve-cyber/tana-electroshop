import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

function formatPrice(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2
  }).format(value);
}

export default function CheckoutModal({ isOpen, cart, total, onClose, onConfirm }) {
  const [orderReference, setOrderReference] = useState("");
  const [orderItemCount, setOrderItemCount] = useState(0);
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstFieldRef.current?.focus();
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const reference = "TANA-" + Math.random().toString(36).slice(2, 8).toUpperCase();
    setOrderItemCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    setOrderReference(reference);
    onConfirm();
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Fermer">
          <Icon name="close" />
        </button>
        {orderReference ? (
          <div className="order-success">
            <span className="success-mark"><Icon name="check" size={28} /></span>
            <p className="eyebrow">Commande simulée</p>
            <h2 id="checkout-title">Merci pour votre confiance.</h2>
            <p className="order-success__copy">
              Votre démonstration de commande est prête. Référence <strong>{orderReference}</strong>.
              Aucun paiement n’a été effectué.
            </p>
            <button className="button button--dark button--full" type="button" onClick={onClose}>
              Continuer la visite <Icon name="arrow" size={17} />
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Dernière étape</p>
            <h2 id="checkout-title">Finaliser ma commande</h2>
            <p className="checkout-intro">Quelques informations pour préparer votre commande de démonstration.</p>
            <form className="checkout-form" onSubmit={handleSubmit}>
              <label>
                Nom complet
                <input ref={firstFieldRef} name="name" type="text" autoComplete="name" placeholder="Ex. Alex Ravel" required />
              </label>
              <label>
                Adresse e-mail
                <input name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" required />
              </label>
              <label>
                Ville de livraison
                <input name="city" type="text" autoComplete="address-level2" placeholder="Antananarivo" required />
              </label>
              <div className="checkout-total">
                <span>Total estimé</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <p className="demo-disclaimer">
                Démonstration portfolio : le formulaire ne transmet aucune donnée et aucun paiement réel n’est demandé.
              </p>
              <button className="button button--dark button--full" type="submit">
                Confirmer la simulation <Icon name="arrow" size={17} />
              </button>
            </form>
          </>
        )}
        <span className="checkout-cart-count">
          {orderReference
            ? orderItemCount + " article(s) dans la commande"
            : cart.reduce((sum, item) => sum + item.quantity, 0) + " article(s) dans la commande"}
        </span>
      </section>
    </div>
  );
}

