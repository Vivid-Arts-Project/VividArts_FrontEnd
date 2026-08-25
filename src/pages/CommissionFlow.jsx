import { useEffect, useRef, useState } from "react";
import UploadPhotoPage from "./UploadPhotoPage";
import CustomisePage from "./CustomisePage";
import Payment from "./Payment";
import { clearCommissionDraft, getCommissionDraft, setCommissionOrder, setCommissionPendingOrder, setCommissionPhoto } from "../commissionDraft";
import { api } from "../api";
import { createPendingPaymentOrder, loadCheckoutCustomer, orderPreferenceKey } from "../pendingOrder";
import { useLocation, useNavigate } from "../router";
import { Redirect } from "../RouterComponents";

/**
 * CommissionFlow
 * Manages the three-step commission flow, each step as a real sub-route
 * so the URL and browser back/forward buttons track progress:
 *   /commission/upload    → UploadPhotoPage  (upload reference photo)
 *   /commission/customize → CustomisePage    (size, frame, people, notes + order summary)
 *   /commission/payment   → Payment          (pay the deposit via PayHere)
 *
 * photoData and order are lifted up here (not into the URL) so that
 * navigating back and forth between steps doesn't lose what the
 * customer already chose.
 */
export default function CommissionFlow({ onBack = () => {}, onNavigate = () => {} }) {
  const navigate = useNavigate();
  const path = useLocation().split(/[?#]/, 1)[0];
  const [photoData, setPhotoData] = useState(() => getCommissionDraft().photoData);
  const [order, setOrder] = useState(() => getCommissionDraft().order);
  const [pendingOrder, setPendingOrder] = useState(() => getCommissionDraft().pendingOrder);
  const checkoutCustomerPromiseRef = useRef(null);
  const pendingCreationRef = useRef(null);

  // If PayHere just redirected back with ?payment=..., land straight on the
  // payment step so it can read the query param and show the confirmation.
  const [isPaymentReturn] = useState(() => new URLSearchParams(window.location.search).has('payment'));
  const defaultStep = isPaymentReturn ? 'payment' : 'upload';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  useEffect(() => {
    checkoutCustomerPromiseRef.current = loadCheckoutCustomer();
  }, []);

  function handlePhotoNext(data) {
    setPhotoData(data);
    setCommissionPhoto(data);
    navigate('/commission/customize');
  }

  async function handleCustomiseNext(orderData) {
    setOrder(orderData);
    setCommissionOrder(orderData);
    const preferenceKey = orderPreferenceKey(orderData);
    if (pendingOrder?.preferenceKey === preferenceKey) {
      navigate('/commission/payment');
      return;
    }

    if (pendingCreationRef.current) return pendingCreationRef.current;
    const saveOrder = (async () => {
      const customer = await (checkoutCustomerPromiseRef.current || loadCheckoutCustomer());
      const savedOrder = await createPendingPaymentOrder(orderData, customer);
      const previousOrder = pendingOrder;
      setPendingOrder(savedOrder);
      setCommissionPendingOrder(savedOrder);
      window.dispatchEvent(new Event('vividarts:pending-orders'));
      navigate('/commission/payment');

      if (previousOrder?.commissionId && previousOrder.commissionId !== savedOrder.commissionId) {
        api.deleteIncompleteOrder(previousOrder.commissionId).catch(() => {});
      }
    })();
    pendingCreationRef.current = saveOrder;
    try {
      await saveOrder;
    } finally {
      pendingCreationRef.current = null;
    }
  }

  function handlePaymentComplete() {
    setPhotoData(null);
    setOrder(null);
    setPendingOrder(null);
    clearCommissionDraft();
    onBack();
  }

  function handleGoToOrders() {
    setPhotoData(null);
    setOrder(null);
    setPendingOrder(null);
    clearCommissionDraft();
    onNavigate('orders');
  }

  function handleReferencePhotosUploaded() {
    setPendingOrder(current => {
      if (!current || current.referencePhotosUploaded) return current;
      const updated = { ...current, referencePhotosUploaded: true };
      setCommissionPendingOrder(updated);
      return updated;
    });
  }

  let page;
  if (path === '/commission' || path === '/commission/') page = <Redirect to={`/commission/${defaultStep}`} replace />;
  else if (path === '/commission/upload') page = <UploadPhotoPage initialPhotoData={photoData} onNext={handlePhotoNext} onBack={onBack} onNavigate={onNavigate}/>;
  else if (path === '/commission/customize') page = photoData
    ? <CustomisePage photoData={photoData} initialOrder={order} onNext={handleCustomiseNext} onBack={() => navigate('/commission/upload')} onNavigate={onNavigate}/>
    : <Redirect to="/commission/upload" replace />;
  else if (path === '/commission/payment') page = order || isPaymentReturn
    ? <Payment
        order={order}
        pendingOrder={pendingOrder}
        referencePhoto={photoData?.photo || null}
        onReferencePhotosUploaded={handleReferencePhotosUploaded}
        onBack={() => navigate('/commission/customize')}
        onComplete={handlePaymentComplete}
        onOrders={handleGoToOrders}
        onNavigate={onNavigate}
        onIncomplete={() => {
          setPhotoData(null);
          setOrder(null);
          setPendingOrder(null);
          clearCommissionDraft();
          onNavigate('orders');
        }}
      />
    : <Redirect to="/commission/upload" replace />;
  else page = <Redirect to="/commission/upload" replace />;

  return <div className="soft-navy-violet-bg min-h-screen text-white">{page}</div>;
}
