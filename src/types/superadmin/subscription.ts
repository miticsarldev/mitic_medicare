
import { Subscription } from "@prisma/client";
import { Doctor, Hospital } from "@prisma/client";

export interface SubscriptionWithDetails extends Subscription {
    doctor?: Doctor & {
        user: {
            name: string;
            email: string;
        };
    };
    hospital?: Hospital & {
        user: {
            name: string;
            email: string;
        };
    };
    payments: {
        amount: number;
        paymentDate: Date;
        paymentMethod: string;
        status: string;
    }[];
}

export interface SubscriptionCardProps {
    subscription: SubscriptionWithDetails;
    onViewDetails: (id: string) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}