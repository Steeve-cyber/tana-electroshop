import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cart from "./components/Cart";
import CheckoutModal from "./components/CheckoutModal";
import Icon from "./components/Icon";
import ProductCard from "./components/ProductCard";
import ProductQuickView from "./components/ProductQuickView";
import { productsData } from "./data/products";
import logoShop from "./assets/logo-shop.png";
import "./App.css";

const FREE_SHIPPING_LIMIT = 150;
const SHIPPING_FEE = 4.9;

function readStorage(key, fallback) {
  try {
    const savedValue = window.localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallback;
  } catch {
    return fallback;
  }
}

function normalize(value) {
  return value
    .toLocaleLowerCase("fr-FR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [sortBy, setSortBy] = useState("featured");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [cart, setCart] = useState(() => {
    const savedCart = readStorage("tana-cart", readStorage("cart", []));
    return Array.isArray(savedCart) ? savedCart.filter((item) => item && item.id && item.quantity > 0) : [];
  });
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = readStorage("tana-favorites", []);
    return Array.isArray(savedFavorites) ? savedFavorites : [];
  });
  const toastTimer = useRef(null);

  const categories = useMemo(
    () => ["Tous", ...new Set(productsData.map((product) => product.category))],
    []
  );

  useEffect(() => {
    try {
      window.localStorage.setItem("tana-cart", JSON.stringify(cart));
    } catch {
      // The storefront remains usable if browser storage is unavailable.
    }
  }, [cart]);

  useEffect(() => {
    try {
      window.localStorage.setItem("tana-favorites", JSON.stringify(favorites));
    } catch {
      // Favorites are kept in memory for this visit when storage is unavailable.
    }
  }, [favorites]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastMessage(""), 2800);
  }, []);

  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);
  const closeProduct = useCallback(() => setSelectedProduct(null), []);

  const filteredProducts = useMemo(() => {
    const query = normalize(searchQuery.trim());
    const results = productsData.filter((product) => {
      const matchesCategory = selectedCategory === "Tous" || product.category === selectedCategory;
      const matchesQuery = !query || normalize(
        product.title + " " + product.description + " " + product.category
      ).includes(query);
      const matchesFavorites = !showFavoritesOnly || favorites.includes(product.id);
      return matchesCategory && matchesQuery && matchesFavorites;
    });

    if (sortBy === "price-low") return results.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") return results.sort((a, b) => b.price - a.price);
    if (sortBy === "newest") return results.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    return results.sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [searchQuery, selectedCategory, showFavoritesOnly, favorites, sortBy]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discountCode ? subtotal * 0.1 : 0;
  const deliveryFee = subtotal === 0 || subtotal >= FREE_SHIPPING_LIMIT ? 0 : SHIPPING_FEE;
  const total = subtotal - discountAmount + deliveryFee;
  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);
  const newProductsCount = productsData.filter((product) => product.isNew).length;

  const scrollToCatalog = () => {
    setMobileMenuOpen(false);
    window.document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" });
  };

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem && existingItem.quantity >= product.stock) {
      showToast("La quantité maximale disponible est déjà dans votre panier.");
      return;
    }
    setCart((currentCart) => {
      const currentItem = currentCart.find((item) => item.id === product.id);
      if (currentItem) {
        return currentCart.map((item) => item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item);
      }
      return [...currentCart, { ...product, quantity: 1 }];
    });
    setSelectedProduct(null);
    showToast(product.title + " ajouté à votre panier.");
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
      return;
    }
    const product = productsData.find((item) => item.id === productId);
    setCart((currentCart) => currentCart.map((item) => item.id === productId
      ? { ...item, quantity: Math.min(newQuantity, product?.stock || newQuantity) }
      : item));
  };

  const removeFromCart = (productId) => {
    const product = productsData.find((item) => item.id === productId);
    setCart((currentCart) => currentCart.filter((item) => item.id !== productId));
    if (product) showToast(product.title + " retiré du panier.");
  };

  const toggleFavorite = (productId) => {
    const wasFavorite = favorites.includes(productId);
    setFavorites((currentFavorites) => wasFavorite
      ? currentFavorites.filter((id) => id !== productId)
      : [...currentFavorites, productId]);
    const product = productsData.find((item) => item.id === productId);
    showToast(wasFavorite ? "Produit retiré des favoris." : (product?.title || "Produit") + " ajouté aux favoris.");
  };

  const applyPromo = (code) => {
    const accepted = code.toUpperCase() === "TANA10";
    if (accepted) setDiscountCode("TANA10");
    return accepted;
  };

  const openFavorites = () => {
    setShowFavoritesOnly(true);
    setSelectedCategory("Tous");
    setMobileMenuOpen(false);
    window.document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCheckout = () => {
    closeCart();
    setIsCheckoutOpen(true);
  };

  return (
    <div className={"storefront" + (mobileMenuOpen ? " menu-open" : "")}>
      <div className="announcement-bar">
        <span className="announcement-bar__sparkle"><Icon name="sparkles" size={15} /></span>
        La nouvelle sélection tech est arrivée <span className="announcement-bar__divider">·</span> Découvrez les nouveautés
        <button type="button" onClick={scrollToCatalog}>Explorer <Icon name="arrow" size={13} /></button>
      </div>

      <header className="site-header">
        <a className="brand" href="#accueil" aria-label="Tana Electro Shop, accueil">
          <span className="brand__mark"><img src={logoShop} alt="" /></span>
          <span className="brand__wordmark"><strong>Tana<span>.</span></strong><small>ELECTRO SHOP</small></span>
        </a>

        <button
          className="mobile-menu-toggle"
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileMenuOpen}
        >
          <Icon name={mobileMenuOpen ? "close" : "menu"} size={22} />
        </button>

        <nav className="main-nav" aria-label="Navigation principale">
          <a href="#accueil" onClick={() => setMobileMenuOpen(false)}>Accueil</a>
          <a href="#catalogue" onClick={() => { setShowFavoritesOnly(false); setMobileMenuOpen(false); }}>La boutique</a>
          <a href="#catalogue" onClick={() => { setSortBy("newest"); setSelectedCategory("Tous"); setShowFavoritesOnly(false); setMobileMenuOpen(false); }}>
            Nouveautés <span className="nav-new-count">{newProductsCount}</span>
          </a>
          <a href="#histoire" onClick={() => setMobileMenuOpen(false)}>Notre approche</a>
        </nav>

        <div className="header-actions">
          <button className="header-action header-action--favorites" type="button" onClick={openFavorites} aria-label={"Voir mes favoris, " + favorites.length + " produit(s)"}>
            <Icon name="heart" size={19} />
            <span>Favoris</span>
            {favorites.length > 0 && <span className="header-action__count">{favorites.length}</span>}
          </button>
          <button className="header-action header-action--cart" type="button" onClick={() => setIsCartOpen(true)}>
            <span className="header-action__bag"><Icon name="bag" size={18} /><b>{totalItemsInCart}</b></span>
            <span>Panier</span>
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="accueil">
          <div className="hero__copy">
            <p className="eyebrow hero__eyebrow"><span /> Tana Electro Shop · Sélection 2026</p>
            <h1>La technologie<br />qui vous <em>ressemble.</em></h1>
            <p className="hero__description">
              Des objets bien pensés, un design qui dure et le plaisir de trouver exactement ce qu’il vous faut.
            </p>
            <div className="hero__actions">
              <button className="button button--dark" type="button" onClick={scrollToCatalog}>
                Découvrir la sélection <Icon name="arrow" size={17} />
              </button>
              <a className="text-link" href="#histoire">Notre engagement <Icon name="arrowUpRight" size={15} /></a>
            </div>
            <div className="hero__social-proof">
              <div className="avatar-stack" aria-hidden="true">
                <span>A</span><span>M</span><span>R</span><span>+</span>
              </div>
              <p><strong>Une sélection qui fait la différence</strong><br />12 essentiels tech, choisis avec soin</p>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__halo" />
            <div className="hero__image-frame">
              <img
                src={productsData[0].image}
                alt="Casque audio Studio Nova, sélection Tana Electro Shop"
                fetchPriority="high"
                onError={(event) => { event.currentTarget.src = "/product-placeholder.svg"; }}
              />
            </div>
            <div className="hero__floating-card">
              <span className="hero__floating-icon"><Icon name="sparkles" size={17} /></span>
              <div><small>LE COUP DE CŒUR</small><strong>Casque Studio Nova</strong></div>
              <span className="hero__floating-rating"><Icon name="star" size={13} /> 4.9</span>
            </div>
            <span className="hero__side-note">La tech en mieux, au quotidien</span>
            <span className="hero__visual-index">01 / 12</span>
          </div>
          <div className="hero__decoration hero__decoration--one" />
          <div className="hero__decoration hero__decoration--two" />
        </section>

        <section className="promise-strip" id="histoire" aria-label="Les engagements de la boutique">
          <div className="promise-item">
            <span className="promise-item__icon"><Icon name="sparkles" size={19} /></span>
            <div><strong>Choix réfléchi</strong><span>Des essentiels qui durent</span></div>
          </div>
          <span className="promise-separator" />
          <div className="promise-item">
            <span className="promise-item__icon"><Icon name="shield" size={19} /></span>
            <div><strong>Parcours simple</strong><span>Tout est clair à chaque étape</span></div>
          </div>
          <span className="promise-separator" />
          <div className="promise-item">
            <span className="promise-item__icon"><Icon name="box" size={19} /></span>
            <div><strong>Une expérience soignée</strong><span>Du premier clic à la commande</span></div>
          </div>
        </section>

        <section className="catalog-section" id="catalogue">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span /> À découvrir maintenant</p>
              <h2>La sélection <em>du moment.</em></h2>
              <p className="section-heading__subtext">Des nouveautés, des indispensables et quelques belles surprises.</p>
            </div>
            <span className="catalog-count">{filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}</span>
          </div>

          <div className="catalog-toolbar">
            <div className="category-tabs" role="group" aria-label="Filtrer par catégorie">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={selectedCategory === category ? "category-tab is-active" : "category-tab"}
                  aria-pressed={selectedCategory === category}
                  onClick={() => { setSelectedCategory(category); setShowFavoritesOnly(false); }}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="catalog-controls">
              <label className="search-box">
                <Icon name="search" size={17} />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Rechercher un produit"
                  aria-label="Rechercher un produit"
                />
                {searchQuery && <button type="button" onClick={() => setSearchQuery("")} aria-label="Effacer la recherche"><Icon name="close" size={15} /></button>}
              </label>
              <label className="sort-control">
                <span className="sr-only">Trier les produits</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="featured">À la une</option>
                  <option value="newest">Nouveautés</option>
                  <option value="price-low">Prix croissant</option>
                  <option value="price-high">Prix décroissant</option>
                </select>
                <Icon name="chevron" size={15} />
              </label>
            </div>
          </div>

          {showFavoritesOnly && (
            <div className="favorites-notice">
              <Icon name="heart" size={16} /> Affichage de vos favoris
              <button type="button" onClick={() => setShowFavoritesOnly(false)}>Tout le catalogue <Icon name="close" size={14} /></button>
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product, index) => (
                <div className="product-grid__item" key={product.id} style={{ "--item-index": index }}>
                  <ProductCard
                    product={product}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={addToCart}
                    onQuickView={setSelectedProduct}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-results">
              <span className="empty-results__icon"><Icon name={showFavoritesOnly ? "heart" : "search"} size={24} /></span>
              <h3>{showFavoritesOnly ? "Vos favoris apparaîtront ici." : "Aucun résultat pour cette recherche."}</h3>
              <p>{showFavoritesOnly ? "Gardez vos produits préférés à portée de main." : "Essayez un autre mot ou une autre catégorie."}</p>
              <button className="button button--outline" type="button" onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Tous");
                setShowFavoritesOnly(false);
              }}>Réinitialiser les filtres</button>
            </div>
          )}
        </section>

        <section className="feature-banner">
          <div className="feature-banner__mark"><Icon name="sparkles" size={21} /></div>
          <div className="feature-banner__text">
            <p className="eyebrow">La bonne idée, au bon moment</p>
            <h2>La nouveauté n’est pas un gadget.<br /><em>C’est le détail qui change tout.</em></h2>
          </div>
          <button className="button button--light" type="button" onClick={() => {
            setSortBy("newest");
            setSelectedCategory("Tous");
            setShowFavoritesOnly(false);
            scrollToCatalog();
          }}>Voir les nouveautés <Icon name="arrow" size={17} /></button>
          <span className="feature-banner__orbit feature-banner__orbit--one" />
          <span className="feature-banner__orbit feature-banner__orbit--two" />
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <a className="brand brand--footer" href="#accueil">
            <span className="brand__mark"><img src={logoShop} alt="" /></span>
            <span className="brand__wordmark"><strong>Tana<span>.</span></strong><small>ELECTRO SHOP</small></span>
          </a>
          <p>La technologie, bien choisie.<br />Une vitrine indépendante imaginée à Antananarivo.</p>
          <div className="footer-nav">
            <a href="#catalogue">La boutique</a>
            <a href="#catalogue" onClick={() => { setSortBy("newest"); setSelectedCategory("Tous"); setShowFavoritesOnly(false); }}>Nouveautés</a>
            <a href="#histoire">Notre approche</a>
          </div>
          <a className="back-to-top" href="#accueil" aria-label="Retour en haut"><Icon name="arrowUpRight" size={18} /></a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Tana Electro Shop · Tous droits réservés</span>
          <span className="demo-note"><span /> Démonstration portfolio · Paiement simulé</span>
        </div>
      </footer>

      <Cart
        cart={cart}
        isOpen={isCartOpen}
        subtotal={subtotal}
        discountAmount={discountAmount}
        deliveryFee={deliveryFee}
        total={total}
        discountCode={discountCode}
        onClose={closeCart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={() => { setCart([]); setDiscountCode(""); showToast("Votre panier est vide."); }}
        onApplyPromo={applyPromo}
        onRemovePromo={() => setDiscountCode("")}
        onCheckout={handleCheckout}
        onShopClick={() => { closeCart(); scrollToCatalog(); }}
      />

      <CheckoutModal
        key={isCheckoutOpen ? "checkout-open" : "checkout-closed"}
        isOpen={isCheckoutOpen}
        cart={cart}
        total={total}
        onClose={closeCheckout}
        onConfirm={() => { setCart([]); setDiscountCode(""); }}
      />

      <ProductQuickView
        product={selectedProduct}
        isFavorite={selectedProduct ? favorites.includes(selectedProduct.id) : false}
        onToggleFavorite={toggleFavorite}
        onAddToCart={addToCart}
        onClose={closeProduct}
      />

      {toastMessage && (
        <div className="toast-message" role="status" aria-live="polite">
          <span><Icon name="check" size={15} /></span>
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;



