import * as React from 'react';

interface RouteProps<T> {
  // eslint-disable-next-line react/no-unused-prop-types
  stateKey: T;
  children: React.ReactNode;
}

interface RouterProps<T> {
  state: T;
  children: React.ReactElement<RouteProps<T>>[];
}

function EnumRouter<T>({
  state,
  children,
}: RouterProps<T>) {
  const current = children.find((x) => x.props.stateKey === state);
  return current || null;
}

EnumRouter.Route = function<T> ({ children }: RouteProps<T>) {
  return (
    // eslint-disable-next-line react/jsx-no-useless-fragment
    <>
      {children}
    </>
  );
};

export default EnumRouter;
