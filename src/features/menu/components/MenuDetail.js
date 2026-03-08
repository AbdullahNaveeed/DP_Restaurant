"use client";

import { useMemo, useState } from "react";
import { useEffect } from "react";
import MenuItemImage from "@/features/menu/components/MenuItemImage";
import { useCart } from "@/context/CartContext";
import toast from "react-hot-toast";
import { HiMinus, HiPlus } from "react-icons/hi";

const ADDONS = [
  { id: "naan", label: "Naan", price: 70 },
  { id: "roti", label: "Roti", price: 35 },
  { id: "water", label: "Water Bottle", price: 80 },
  { id: "bottle", label: "Any Bottle", price: 150 },
];

function MenuDetail({ item }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addons, setAddons] = useState({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(() => (item.variants && item.variants.length ? item.variants[0].id : null));

  const handleAddonChange = (id, delta) => {
    setAddons((prev) => {
      const next = { ...prev };
      next[id] = Math.max(0, (next[id] || 0) + delta);
      console.debug("Addon change:", id, delta);
      return next;
    });
  };

  const availableAddons = item.options && item.options.length ? item.options : ADDONS;

  const unitAddonTotal = useMemo(() => {
    return availableAddons.reduce((sum, a) => sum + (addons[a.id] || 0) * a.price, 0);
  }, [addons, availableAddons]);

  const selectedVariant = (item.variants || []).find((v) => v.id === selectedVariantId);
  const variantMultiplier = selectedVariant ? Number(selectedVariant.priceMultiplier || 1) : 1;

  const basePrice = Number(item.price) || 0;
  const unitBasePrice = basePrice * variantMultiplier;
  const unitPrice = unitBasePrice + unitAddonTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    const selectedAddons = availableAddons
      .map((a) => ({
        id: a.id,
        name: a.label,
        price: a.price,
        quantity: addons[a.id],
      }))
      .filter((a) => a.quantity && a.quantity > 0);

    const addonKey = selectedAddons.map((a) => `${a.id}x${a.quantity}`).join(",");
    const variantKey = selectedVariant ? `${selectedVariant.id}` : "default";
    const cartId = `${item._id}::${variantKey}::${addonKey}`;

    const payload = {
      _id: cartId,
      baseId: item._id,
      name: item.name + (selectedVariant ? ` (${selectedVariant.label})` : ""),
      price: unitPrice,
      imageURL: (item.imageURLs && item.imageURLs.length ? item.imageURLs[activeIndex] : item.imageURL),
      description: item.description,
      variant: selectedVariant ? { id: selectedVariant.id, label: selectedVariant.label } : null,
      addons: selectedAddons,
      quantity,
    };

    // Dispatch a single add with desired quantity (reducer will merge)
    addItem(payload);

    toast.success(`${item.name} added to cart`);
  };

  useEffect(() => {
    console.debug("MenuDetail mounted for", item && item._id);
  }, [item && item._id]);
  const fmt = (v) => {
    try {
      return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(v);
    } catch (e) {
      return `PKR ${Number(v).toLocaleString()}`;
    }
  };

  return (
    <div id={`menu-detail-root-${item._id}`} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        {/** Image gallery: main image + thumbnails */}
        <div className="relative w-full overflow-hidden rounded-xl bg-bg-elevated">
          <MenuItemImage src={(item.imageURLs && item.imageURLs.length ? item.imageURLs[activeIndex] : item.imageURL || "/images/menu-fallback.svg")} alt={`${item.name} image ${activeIndex + 1}`} className="h-full w-full object-cover" />
        </div>

        <div className="mt-3 flex gap-2">
          {(item.imageURLs && item.imageURLs.length ? item.imageURLs : item.imageURL ? [item.imageURL] : ["/images/menu-fallback.svg"]).slice(0, 4).map((src, i) => (
            <button
              key={i}
              type="button"
              data-thumb-index={i}
              onClick={() => setActiveIndex(i)}
              className={`overflow-hidden rounded-md border ${i === activeIndex ? "border-accent-gold" : "border-border-color"}`}
            >
              <img
                src={src}
                alt={`${item.name} thumb ${i + 1}`}
                className="h-16 w-24 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/menu-fallback.svg";
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-text-primary">{item.name}</h1>
        <p className="mt-2 text-text-muted">{item.description}</p>

        <div className="mt-4">
          <div className="text-sm text-text-muted">Base price</div>
          <div className="text-lg font-semibold text-accent-gold">{fmt(basePrice)}</div>
        </div>

        {item.variants && item.variants.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 font-medium">Choose Size / Quantity</div>
            <div className="flex flex-wrap gap-2">
              {item.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  data-variant-id={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-all ${
                    selectedVariantId === v.id
                      ? "gold-gradient text-bg-primary shadow-lg"
                      : "border border-border-color bg-bg-card text-text-secondary hover:border-accent-gold/50 hover:text-text-primary"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}
    {/* Server-rendered fallback script to make buttons work even if React hydration fails */}
    <script type="application/json" id={`menu-detail-data-${item._id}`}>
      {JSON.stringify({
        _id: item._id,
        name: item.name,
        description: item.description,
        basePrice: basePrice,
        variants: item.variants || [],
        options: item.options || [],
        imageURLs: item.imageURLs || (item.imageURL ? [item.imageURL] : []),
      })}
    </script>
    <script dangerouslySetInnerHTML={{ __html: `(() => {
      try {
        function initMenuDetail(){
          const root = document.getElementById('menu-detail-root-${item._id}');
          if (!root) return;
          const dataEl = document.getElementById('menu-detail-data-${item._id}');
          const data = dataEl ? JSON.parse(dataEl.textContent || '{}') : {};

          let state = {
            selectedVariantId: (data.variants && data.variants.length) ? data.variants[0].id : null,
            quantity: 1,
            addons: {},
            activeIndex: 0,
          };

          const qtyDisplay = document.getElementById('md-qty-${item._id}');
          const totalEl = document.getElementById('md-total-${item._id}');

          function formatPKR(v){ try { return new Intl.NumberFormat('en-PK',{style:'currency',currency:'PKR',maximumFractionDigits:0}).format(v); } catch(e){ return 'PKR ' + Number(v).toLocaleString(); } }

          function calcUnitPrice(){
            const base = Number(data.basePrice || 0);
            const variant = (data.variants||[]).find(v => v.id === state.selectedVariantId);
            const vm = variant ? Number(variant.priceMultiplier || 1) : 1;
            const addonTotal = (data.options||[]).reduce((s,a)=> s + ((state.addons[a.id]||0) * Number(a.price||0)), 0);
            return base * vm + addonTotal;
          }

          function updateDisplay(){
            if (qtyDisplay) qtyDisplay.textContent = String(state.quantity);
            if (totalEl) totalEl.textContent = formatPKR(calcUnitPrice() * state.quantity);
          }

          // Variant buttons
          root.querySelectorAll('[data-variant-id]').forEach(btn => {
            btn.addEventListener('click', () => {
              state.selectedVariantId = btn.dataset.variantId || null;
              root.querySelectorAll('[data-variant-id]').forEach(b => b.classList.remove('active-variant'));
              btn.classList.add('active-variant');
              updateDisplay();
            });
          });

          // Thumb buttons
          root.querySelectorAll('[data-thumb-index]').forEach(btn => {
            btn.addEventListener('click', () => {
              state.activeIndex = Number(btn.dataset.thumbIndex || 0);
              // highlight if desired
            });
          });

          // Quantity
          const inc = root.querySelector('[data-qty-inc]');
          const dec = root.querySelector('[data-qty-dec]');
          if (inc) inc.addEventListener('click', () => { state.quantity = Math.max(1, (state.quantity||1) + 1); updateDisplay(); });
          if (dec) dec.addEventListener('click', () => { state.quantity = Math.max(1, (state.quantity||1) - 1); updateDisplay(); });

          // Addon buttons
          root.querySelectorAll('[data-addon-id]').forEach(btn => {
            const aid = btn.dataset.addonId;
            const action = btn.dataset.addonAction;
            btn.addEventListener('click', () => {
              state.addons[aid] = Math.max(0, (state.addons[aid]||0) + (action === 'inc' ? 1 : -1));
              const disp = document.getElementById('md-addon-' + aid + '-${item._id}');
              if (disp) disp.textContent = String(state.addons[aid] || 0);
              updateDisplay();
            });
          });

          // Add to cart
          const addBtn = document.getElementById('md-add-button-${item._id}');
          if (addBtn) addBtn.addEventListener('click', () => {
            try {
              const selectedAddons = (data.options||[]).filter(a => (state.addons[a.id]||0) > 0).map(a => ({ id: a.id, name: a.label, price: a.price, quantity: state.addons[a.id] }));
              const addonKey = selectedAddons.map(a => a.id + 'x' + a.quantity).join(',');
              const variantKey = state.selectedVariantId || 'default';
              const cartId = data._id + '::' + variantKey + '::' + addonKey;
              const unitPrice = calcUnitPrice();

              const payload = { _id: cartId, baseId: data._id, name: data.name + (state.selectedVariantId ? (' (' + state.selectedVariantId + ')') : ''), price: unitPrice, imageURL: (data.imageURLs && data.imageURLs.length) ? data.imageURLs[state.activeIndex||0] : '', description: data.description, variant: state.selectedVariantId ? { id: state.selectedVariantId } : null, addons: selectedAddons, quantity: state.quantity };

              const raw = localStorage.getItem('restaurant_cart');
              let cart = raw ? JSON.parse(raw) : { items: [], totalItems: 0, totalAmount: 0 };
              const idx = cart.items.findIndex(it => it._id === payload._id);
              if (idx > -1) {
                cart.items[idx].quantity = (cart.items[idx].quantity || 0) + payload.quantity;
              } else {
                cart.items.push(payload);
              }
              cart.totalItems = cart.items.reduce((s,i) => s + (i.quantity||0), 0);
              cart.totalAmount = cart.items.reduce((s,i) => s + (Number(i.price||0) * (i.quantity||0)), 0);
              localStorage.setItem('restaurant_cart', JSON.stringify(cart));
              // Navigate to cart to show change
              window.location.href = '/cart';
            } catch (e) { console.error('add to cart failed', e); alert('Failed to add to cart'); }
          });

          // initialize display
          updateDisplay();
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initMenuDetail);
        } else {
          initMenuDetail();
        }
      } catch (e) { console.error('menu-detail fallback script error', e); }
    })();` }} />

            <div className="mt-6 space-y-4">
          <div>
            <div className="mb-2 font-medium">Quantity</div>
            <div className="flex items-center gap-2">
              <button data-qty-dec="true" onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="btn-secondary"><HiMinus /></button>
              <div id={`md-qty-${item._id}`} className="w-12 text-center">{quantity}</div>
              <button data-qty-inc="true" onClick={() => setQuantity((q) => q + 1)} className="btn-secondary"><HiPlus /></button>
            </div>
          </div>

          <div>
            <div className="mb-2 font-medium">Add-ons</div>
            <div className="space-y-2">
              {availableAddons.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-sm">{a.label}</div>
                    <div className="text-xs text-text-muted">({fmt(a.price)})</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button data-addon-id={a.id} data-addon-action="dec" onClick={() => handleAddonChange(a.id, -1)} className="btn-secondary">-</button>
                    <div id={`md-addon-${a.id}-${item._id}`} className="w-8 text-center">{addons[a.id] || 0}</div>
                    <button data-addon-id={a.id} data-addon-action="inc" onClick={() => handleAddonChange(a.id, 1)} className="btn-secondary">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 font-medium">Total</div>
            <div id={`md-total-${item._id}`} className="text-xl font-bold text-accent-gold">{fmt(totalPrice)}</div>
          </div>

          <div>
            <button id={`md-add-button-${item._id}`} onClick={handleAddToCart} className="btn-primary w-full rounded-lg text-sm">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuDetail;

