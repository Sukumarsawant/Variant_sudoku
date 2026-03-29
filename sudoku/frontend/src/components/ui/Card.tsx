import type { PropsWithChildren, ReactNode } from "react";
import { clsx } from "clsx";

interface CardProps extends PropsWithChildren {
	title?: string;
	subtitle?: string;
	action?: ReactNode;
	className?: string;
}

export function Card({ title, subtitle, action, className, children }: CardProps) {
	return (
		<section className={clsx("card-surface p-4", className)}>
			{(title || subtitle || action) && (
				<header className="mb-3 flex items-start justify-between gap-3">
					<div>
						{title && <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
						{subtitle && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>}
					</div>
					{action}
				</header>
			)}
			{children}
		</section>
	);
}
