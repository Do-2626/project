"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReceiptPage() {
  const params = useParams();
  // const [receiptData, setReceiptData] = useState(null);

  // Receipt data timp
  const receiptData = {
    id: 1,
    customer: "John Doe",
    date: "2021-08-01",
    amount: 100,
  };

  useEffect(() => {
    // Here you can fetch receipt data using the ID
    // const fetchReceipt = async () => {
    //   try {
    //     const response = await fetch(`/api/cast/receipts/${params.id}`);
    //     const data = await response.json();
    //     setReceiptData(data);
    //     console.log(
    //       "Fetched receipt data for receipt ID",
    //       params.id,
    //       ":",
    //       data
    //     );
    //   } catch (error) {
    //     console.error("Error fetching receipt:", error);
    //   }
    // };

    // if (params.id) {
    //   fetchReceipt();
    // }
  }, [params.id]);

  if (!receiptData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Receipt #{params.id}</h1>
      {/* Receipt layout */}
      <div className="flex justify-between mb-4">
        <div>
          <p>Receipt ID: {receiptData.id}</p>
          <p>Customer: {receiptData.customer}</p>
        </div>
        <div>
          <p>Date: {receiptData.date}</p>
          <p>Amount: {receiptData.amount}</p>
        </div>
      </div>

      {/* Add your receipt display logic here */}
    </div>
  );
}
