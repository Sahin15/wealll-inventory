import { useEffect, useState } from 'react';
import api from '../services/api';

let cachedPayload = null;
let inFlightPromise = null;

async function fetchPublicPricing() {
  if (cachedPayload) return cachedPayload;
  if (!inFlightPromise) {
    inFlightPromise = api.get('/public/pricing').then((res) => {
      if (res.data?.success) {
        cachedPayload = res.data.data;
      }
      return cachedPayload;
    }).finally(() => {
      inFlightPromise = null;
    });
  }
  return inFlightPromise;
}

export function invalidatePublicPricingCache() {
  cachedPayload = null;
}

export default function usePublicPricing() {
  const [data, setData] = useState(cachedPayload);
  const [loading, setLoading] = useState(!cachedPayload);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetchPublicPricing()
      .then((payload) => {
        if (!mounted) return;
        if (payload) setData(payload);
        else setError('Pricing is temporarily unavailable.');
      })
      .catch(() => {
        if (mounted) setError('Pricing is temporarily unavailable.');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return { data, loading, error };
}
