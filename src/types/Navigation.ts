export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type RootStackParamList = {
  Home: undefined;
  IndicacaoForm: { id?: number } | undefined;
  IndicacaoDetails: { id: number };
  ApiSearch: undefined;
  History: undefined;
};
