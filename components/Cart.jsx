import React from 'react';

function Cart({ cart, isOpen, onClose, onUpdateQuantity, onRemoveItem, onClearCart }) {
  if (!isOpen) return null;

  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '380px',
      height: '100vh',
      backgroundColor: '#fff',
      boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      padding: '20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#333' }}>🛒 Mon Panier</h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#888' }}
          >
            ✖
          </button>
        </div>

        <div style={{ marginTop: '20px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
          {cart.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>Votre panier est vide.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #f9f9f9', paddingBottom: '10px' }}>
                <img src={item.image} alt={item.title} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }} />
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem' }}>{item.title}</h4>
                  <div style={{ color: '#2ecc71', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {(item.price * item.quantity).toFixed(2)} €
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      style={{ padding: '2px 8px', border: '1px solid #ccc', background: '#f5f5f5', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      style={{ padding: '2px 8px', border: '1px solid #ccc', background: '#f5f5f5', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => onRemoveItem(item.id)}
                  style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1.1rem', marginLeft: '10px' }}
                  title="Supprimer"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {cart.length > 0 && (
        <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px' }}>
            <span>Total :</span>
            <span style={{ color: '#2ecc71' }}>{totalPrice.toFixed(2)} €</span>
          </div>
          <button 
            onClick={() => alert('Commande validée avec succès !')}
            style={{ width: '100%', padding: '12px', background: '#2ecc71', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}
          >
            Commander
          </button>
          <button 
            onClick={onClearCart}
            style={{ width: '100%', padding: '8px', background: '#f5f5f5', color: '#e74c3c', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Vider le panier
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;