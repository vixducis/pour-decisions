import { useMemo } from 'react';

export const useMoneyFormat = (currency: string) =>
    useMemo(() => {
        const formatter = new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
        });

        return (input: number) => formatter.format(input);
    }, [currency]);
