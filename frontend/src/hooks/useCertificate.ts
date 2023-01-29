import {
	createCertificate,
	getCertificate,
	setCertificate,
	Certificate,
} from "api/npm";
import { useMutation, useQuery, useQueryClient } from "react-query";

const fetchCertificate = (id: any) => {
	return getCertificate(id);
};

const useCertificate = (id: number, options = {}) => {
	return useQuery<Certificate, Error>(
		["certificate", id],
		() => fetchCertificate(id),
		{
			staleTime: 60 * 1000, // 1 minute
			...options,
		},
	);
};

const useSetCertificate = () => {
	const queryClient = useQueryClient();
	return useMutation(
		(values: Certificate) => {
			return values.id
				? setCertificate(values.id, values)
				: createCertificate(values);
		},
		{
			onMutate: (values) => {
				const previousObject = queryClient.getQueryData([
					"certificate",
					values.id,
				]);

				queryClient.setQueryData(["certificate", values.id], (old: any) => ({
					...old,
					...values,
				}));

				return () =>
					queryClient.setQueryData(["certificate", values.id], previousObject);
			},
			onError: (error, values, rollback: any) => rollback(),
			onSuccess: async ({ id }: Certificate) => {
				queryClient.invalidateQueries(["certificate", id]);
				queryClient.invalidateQueries("certificate");
			},
		},
	);
};

export { useCertificate, useSetCertificate };