import { useEffect, useState } from "react";
import { socket } from "../api/socket";

function useRealtimePrices() {
  const [priceUpdates, setPriceUpdates] = useState({});
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    function handleConnect() {
      setIsSocketConnected(true);
      console.log("Connected to real-time price stream");
    }

    function handleDisconnect() {
      setIsSocketConnected(false);
      console.log("Disconnected from real-time price stream");
    }

    function handlePriceUpdates(updates) {
      setPriceUpdates((currentUpdates) => {
        const nextUpdates = { ...currentUpdates };

        updates.forEach((update) => {
          nextUpdates[update.id] = update;
        });

        return nextUpdates;
      });
    }

    socket.connect();

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("priceUpdates", handlePriceUpdates);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("priceUpdates", handlePriceUpdates);
      socket.disconnect();
    };
  }, []);

  return {
    priceUpdates,
    isSocketConnected,
  };
}

export default useRealtimePrices;