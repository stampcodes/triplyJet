import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { sepolia } from "viem/chains";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { parseUnits } from "viem";
import styles from "./PayButton.module.css";
import { useState, useEffect } from "react";
import { usePurchaseStore } from "../../store/purchaseStore";
interface PayButtonProps {
  price: number;
  itemName: string;
}

interface Purchase {
  id: string;
  item: string;
  price: string;
  date: string;
}

const PayButton: React.FC<PayButtonProps> = ({ price, itemName }) => {
  const { sendTransactionAsync, data: hash } = useSendTransaction();
  const { address } = useAccount();
  const { open } = useWeb3Modal();
  const [started, setStarted] = useState(false);
  const [errors, setErrors] = useState("");

  const addPurchase = usePurchaseStore((state) => state.addPurchase);

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  const handlePayment = async () => {
    try {
      setErrors("");
      setStarted(true);
      if (!address) {
        await open();
      }

      const weiPrice = parseUnits(price.toString(), 18);
      const data = await sendTransactionAsync({
        to: "0x342F6824339fAd0a37eEAD57e590DC97fbCbE4aE",
        value: weiPrice,
        chainId: sepolia.id,
      });

      console.log("Transaction data:", data);
    } catch (error) {
      console.log(error);
      setStarted(false);
      setErrors("Payment failed. Please try again.");
    } finally {
      setStarted(false);
    }
  };
  useEffect(() => {
    if (errors) {
      const timer = setTimeout(() => {
        setErrors("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    if (isConfirmed && hash) {
      const newPurchase: Purchase = {
        id: hash,
        item: itemName,
        price: `${price} ETH`,
        date: new Date().toLocaleDateString(),
      };
      addPurchase(newPurchase);
      setStarted(false);
    }
  }, [isConfirmed, hash, itemName, price, addPurchase]);

  return (
    <>
      <div className={styles.container}>
        {!isConfirming && !isConfirmed && (
          <button
            disabled={started}
            className={styles.payButton}
            onClick={handlePayment}
          >
            {started ? "Confirming..." : "Pay Now"}
          </button>
        )}

        {isConfirmed && (
          <p className={styles.successfulPayment}>
            Thank you for your payment.
          </p>
        )}
        {errors && <p className={styles.failedPayment}>{errors}</p>}
        {isConfirming && (
          <div className={styles.waitingPayment}>
            Waiting for confirmation...
          </div>
        )}
      </div>
    </>
  );
};

export default PayButton;
