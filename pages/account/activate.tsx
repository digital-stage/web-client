import { useRouter } from 'next/router';
import React from 'react';
import ActivationForm from "../../components/forms/account/ActivationForm";

const Activate = (): JSX.Element => {
  const { query } = useRouter();

  const initialCode = Array.isArray(query.code) ? query.code[0] : query.code;

  return (
      <ActivationForm initialCode={initialCode} />
  );
};

export default Activate;