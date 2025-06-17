"use client";
import React, { useState, useEffect } from "react";
import { paymentApi, formatCurrency, formatDate } from "@/utils/api";
import { useAuth } from "@/utils/auth-context";

export default function PaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const fetchPayments = async (page = 1) => {
    if (!user?.company?.id) return;

    setLoading(true);
    try {
      const response = await paymentApi.getPayments({
        company: user.company.id,
        limit: pagination.limit,
        page
      });
      
      setPayments(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user?.company?.id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-green-500 bg-green-500 bg-opacity-10';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500 bg-opacity-10';
      case 'cancelled':
      case 'failed':
        return 'text-red-500 bg-red-500 bg-opacity-10';
      default:
        return 'text-gray-500 bg-gray-500 bg-opacity-10';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Betalt';
      case 'pending': return 'Venter';
      case 'cancelled': return 'Kansellert';
      case 'failed': return 'Feilet';
      case 'overdue': return 'Forfalt';
      default: return status;
    }
  };
  return (
    <section className="py-4 overflow-hidden">
      <div className="container px-4 mx-auto">
        <div className="py-5 bg-white border rounded-xl">
          <div className="px-6">
            <h3 className="font-heading pb-8 text-lg text-neutral-600 font-semibold">
              Betalingsoversikt
            </h3>
            <div className="mb-5 w-full overflow-x-auto">
              <table className="w-full min-w-max">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3.5 border-b border-neutral-100">
                      <a
                        className="inline-flex items-center text-sm text-gray-500 font-medium uppercase"
                        href="#"
                      >
                        <span className="mr-1.5">Id</span>
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.7636 6.56365C5.11508 6.21218 5.68492 6.21218 6.0364 6.56365L9 9.52726L11.9636 6.56365C12.3151 6.21218 12.8849 6.21218 13.2364 6.56365C13.5879 6.91512 13.5879 7.48497 13.2364 7.83645L9.6364 11.4364C9.28492 11.7879 8.71508 11.7879 8.3636 11.4364L4.7636 7.83645C4.41213 7.48497 4.41213 6.91512 4.7636 6.56365Z"
                            fill="#7F8995"
                          />
                        </svg>
                      </a>
                    </th>
                    <th className="pb-3.5 border-b border-neutral-100">
                      <a
                        className="inline-flex items-center text-sm text-gray-500 font-medium"
                        href="#"
                      >
                        <span className="mr-1.5">Beskrivelse</span>
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.7636 6.56365C5.11508 6.21218 5.68492 6.21218 6.0364 6.56365L9 9.52726L11.9636 6.56365C12.3151 6.21218 12.8849 6.21218 13.2364 6.56365C13.5879 6.91512 13.5879 7.48497 13.2364 7.83645L9.6364 11.4364C9.28492 11.7879 8.71508 11.7879 8.3636 11.4364L4.7636 7.83645C4.41213 7.48497 4.41213 6.91512 4.7636 6.56365Z"
                            fill="#7F8995"
                          />
                        </svg>
                      </a>
                    </th>
                    <th className="pb-3.5 border-b border-neutral-100">
                      <a
                        className="inline-flex items-center text-sm text-gray-500 font-medium"
                        href="#"
                      >
                        <span className="mr-1.5">Pris</span>
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.7636 6.56365C5.11508 6.21218 5.68492 6.21218 6.0364 6.56365L9 9.52726L11.9636 6.56365C12.3151 6.21218 12.8849 6.21218 13.2364 6.56365C13.5879 6.91512 13.5879 7.48497 13.2364 7.83645L9.6364 11.4364C9.28492 11.7879 8.71508 11.7879 8.3636 11.4364L4.7636 7.83645C4.41213 7.48497 4.41213 6.91512 4.7636 6.56365Z"
                            fill="#7F8995"
                          />
                        </svg>
                      </a>
                    </th>
                    <th className="pb-3.5 border-b border-neutral-100">
                      <a
                        className="inline-flex items-center text-sm text-gray-500 font-medium"
                        href="#"
                      >
                        <span className="mr-1.5">Type</span>
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.7636 6.56365C5.11508 6.21218 5.68492 6.21218 6.0364 6.56365L9 9.52726L11.9636 6.56365C12.3151 6.21218 12.8849 6.21218 13.2364 6.56365C13.5879 6.91512 13.5879 7.48497 13.2364 7.83645L9.6364 11.4364C9.28492 11.7879 8.71508 11.7879 8.3636 11.4364L4.7636 7.83645C4.41213 7.48497 4.41213 6.91512 4.7636 6.56365Z"
                            fill="#7F8995"
                          />
                        </svg>
                      </a>
                    </th>
                    <th className="pb-3.5 border-b border-neutral-100">
                      <a
                        className="inline-flex items-center text-sm text-gray-500 font-medium"
                        href="#"
                      >
                        <span className="mr-1.5">Fakturadato</span>
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.7636 6.56365C5.11508 6.21218 5.68492 6.21218 6.0364 6.56365L9 9.52726L11.9636 6.56365C12.3151 6.21218 12.8849 6.21218 13.2364 6.56365C13.5879 6.91512 13.5879 7.48497 13.2364 7.83645L9.6364 11.4364C9.28492 11.7879 8.71508 11.7879 8.3636 11.4364L4.7636 7.83645C4.41213 7.48497 4.41213 6.91512 4.7636 6.56365Z"
                            fill="#7F8995"
                          />
                        </svg>
                      </a>
                    </th>
                    <th className="pb-3.5 border-b border-neutral-100">
                      <a
                        className="inline-flex items-center text-sm text-gray-500 font-medium"
                        href="#"
                      >
                        <span className="mr-1.5">Status</span>
                        <svg
                          width={18}
                          height={18}
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.7636 6.56365C5.11508 6.21218 5.68492 6.21218 6.0364 6.56365L9 9.52726L11.9636 6.56365C12.3151 6.21218 12.8849 6.21218 13.2364 6.56365C13.5879 6.91512 13.5879 7.48497 13.2364 7.83645L9.6364 11.4364C9.28492 11.7879 8.71508 11.7879 8.3636 11.4364L4.7636 7.83645C4.41213 7.48497 4.41213 6.91512 4.7636 6.56365Z"
                            fill="#7F8995"
                          />
                        </svg>
                      </a>
                    </th>
                    <th className="pb-3.5 border-b border-neutral-100" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        Laster betalingshistorikk...
                      </td>
                    </tr>
                  ) : payments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        Ingen betalinger funnet
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment, index) => (
                      <tr key={payment._id || index}>
                        <td className="py-2.5 pr-4 border-b border-neutral-100">
                          <span className="font-medium">#{payment.invoiceId || payment._id?.slice(-6)}</span>
                        </td>
                        <td className="py-2.5 pr-4 border-b border-neutral-100">
                          <div className="flex flex-wrap items-center">
                            <span className="font-semibold">{payment.description}</span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 border-b border-neutral-100">
                          <span className="font-medium">{formatCurrency(payment.amount)}</span>
                        </td>
                        <td className="py-2.5 pr-4 border-b border-neutral-100">
                          <span className="font-medium">
                            {payment.type === 'subscription' ? 'Abonnement' : 
                             payment.type === 'addon' ? 'Tillegg' : 'Engangssum'}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 border-b border-neutral-100">
                          <span className="text-neutral-500 font-medium">
                            {formatDate(payment.invoiceDate)}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4 border-b border-neutral-100">
                          <span className={`px-2.5 py-1 text-sm font-medium rounded-full ${getStatusColor(payment.status)}`}>
                            {getStatusText(payment.status)}
                          </span>
                        </td>
                        <td className="py-2.5 border-b border-neutral-100">
                          <button className="inline-flex py-2.5 pr-0">
                            <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                            <span className="mx-0.5 w-1 h-1 bg-neutral-200 rounded-full" />
                            <span className="w-1 h-1 bg-neutral-200 rounded-full" />
                          </button>
                        </td>
                      </tr>
                                         ))
                   )}
                </tbody>
              </table>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-between -m-2">
                <div className="w-auto p-2">
                  <div className="flex flex-wrap -m-0.5">
                    <div className="w-auto p-0.5">
                      <button
                        onClick={() => pagination.page > 1 && fetchPayments(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="flex items-center justify-center w-9 h-9 border rounded-sm hover:border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          width={7}
                          height={12}
                          viewBox="0 0 7 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M6 10.6666L1.33333 5.99998L6 1.33331"
                            stroke="#71717A"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <div key={pageNum} className="w-auto p-0.5">
                          <button
                            onClick={() => fetchPayments(pageNum)}
                            className={`flex items-center justify-center w-9 h-9 border rounded-sm ${
                              pagination.page === pageNum
                                ? 'border-neutral-600'
                                : 'hover:border-neutral-300'
                            }`}
                          >
                            <span className="text-sm text-neutral-400 font-semibold">
                              {pageNum}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                    <div className="w-auto p-0.5">
                      <button
                        onClick={() => pagination.page < pagination.totalPages && fetchPayments(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="flex items-center justify-center w-9 h-9 border rounded-sm hover:border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg
                          width={7}
                          height={12}
                          viewBox="0 0 7 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M1 1.33335L5.66667 6.00002L1 10.6667"
                            stroke="#71717A"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-auto p-2">
                  <p className="text-sm text-neutral-400">
                    Viser side {pagination.page} av {pagination.totalPages} ({pagination.total} resultater)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
