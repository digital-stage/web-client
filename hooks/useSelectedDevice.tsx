import React, {createContext, useState} from "react";

interface ISelectedDeviceContext {
  device?: string,
  setDevice: (device: string) => any
}

const SelectedDeviceContext = createContext<ISelectedDeviceContext>({
  setDevice: () => {
    throw new Error("Missing provider")
  }
});

export const SelectedDeviceProvider = (props: { children: React.ReactNode }) => {
  const {children} = props;
  const [device, setDevice] = useState<string>();

  return (
    <SelectedDeviceContext.Provider value={{
      device,
      setDevice
    }}>
      {children}
    </SelectedDeviceContext.Provider>)
}

const useSelectedDevice = (): ISelectedDeviceContext => React.useContext<ISelectedDeviceContext>(SelectedDeviceContext);

export default useSelectedDevice;