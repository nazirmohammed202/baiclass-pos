"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Building2,
  Loader2,
  Package,
  Search,
  User,
} from "lucide-react";
import {
  filterNavItems,
  filterSearchEntities,
  type GlobalSearchEntityResult,
  type GlobalSearchNavItem,
} from "@/lib/global-search-catalog";
import { fetchGlobalSearchEntities } from "@/lib/global-search-actions";
import { usePermissions } from "@/hooks/usePermissions";

type ResultItem =
  | { kind: "nav"; item: GlobalSearchNavItem }
  | { kind: "customer"; id: string; title: string; subtitle: string }
  | { kind: "product"; id: string; title: string; subtitle: string }
  | { kind: "supplier"; id: string; title: string; subtitle: string };

const GlobalSearch = () => {
  const { branchId } = useParams();
  const router = useRouter();
  const { canAccessSearchNavItem } = usePermissions();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loadingEntities, setLoadingEntities] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [entities, setEntities] = useState<GlobalSearchEntityResult | null>(
    null
  );

  const ensureEntities = useCallback(async () => {
    if (entities || !branchId || loadingEntities) return;
    setLoadingEntities(true);
    try {
      const data = await fetchGlobalSearchEntities(branchId as string);
      setEntities(data);
    } catch (error) {
      console.error("Failed to load search data:", error);
    } finally {
      setLoadingEntities(false);
    }
  }, [branchId, entities, loadingEntities]);

  const navResults = useMemo(
    () =>
      filterNavItems(query, {
        canAccessItem: canAccessSearchNavItem,
      }).slice(0, 10),
    [query, canAccessSearchNavItem]
  );

  const entityResults = useMemo(() => {
    if (!entities || !query.trim()) {
      return { customers: [], products: [], suppliers: [] };
    }
    return filterSearchEntities(entities, query);
  }, [entities, query]);

  const flatResults = useMemo((): ResultItem[] => {
    const items: ResultItem[] = navResults.map((item) => ({
      kind: "nav",
      item,
    }));

    entityResults.customers.forEach((customer) => {
      items.push({
        kind: "customer",
        id: customer._id,
        title: customer.name,
        subtitle: customer.phoneNumber || "Customer",
      });
    });

    entityResults.products.forEach((product) => {
      const d = product.details;
      items.push({
        kind: "product",
        id: product._id,
        title: d.name,
        subtitle: [d.manufacturer, d.size].filter(Boolean).join(" · ") || "Product",
      });
    });

    entityResults.suppliers.forEach((supplier) => {
      items.push({
        kind: "supplier",
        id: supplier._id,
        title: supplier.name,
        subtitle: supplier.phoneNumbers?.[0] || "Supplier",
      });
    });

    return items;
  }, [navResults, entityResults]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, flatResults.length]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateToResult = (result: ResultItem) => {
    if (!branchId) return;
    const base = `/${branchId as string}`;

    let href = base;
    switch (result.kind) {
      case "nav":
        href = `${base}${result.item.href}`;
        break;
      case "customer":
        href = `${base}/menu/customers/${result.id}`;
        break;
      case "product":
        href = `${base}/menu/stock?search=${encodeURIComponent(result.title)}`;
        break;
      case "supplier":
        href = `${base}/menu/suppliers/${result.id}`;
        break;
    }

    setOpen(false);
    setQuery("");
    router.push(href);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "Enter")) {
      setOpen(true);
      void ensureEntities();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && flatResults[activeIndex]) {
      event.preventDefault();
      navigateToResult(flatResults[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const showDropdown = open && (query.trim().length > 0 || navResults.length > 0);

  return (
    <div ref={containerRef} className="relative flex items-center flex-1 min-w-0 lg:min-w-[200px]">
      <Search className="absolute left-2 sm:left-3 w-4 h-4 sm:w-[18px] sm:h-[18px] text-gray-400 pointer-events-none" />

      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder="Search pages, products, customers..."
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          void ensureEntities();
        }}
        onFocus={() => {
          setOpen(true);
          void ensureEntities();
        }}
        onKeyDown={handleKeyDown}
        className="w-full rounded-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 text-sm sm:text-base bg-white dark:bg-neutral-900 dark:border-none border border-gray-200 dark:border-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        role="combobox"
      />

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 z-[100] bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl shadow-lg overflow-hidden max-h-[min(70vh,420px)] overflow-y-auto">
          {loadingEntities && !entities && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading customers, products, and suppliers...
            </div>
          )}

          {flatResults.length === 0 && !loadingEntities && (
            <div className="px-4 py-6 text-sm text-center text-gray-500 dark:text-gray-400">
              No results for &quot;{query}&quot;
            </div>
          )}

          {flatResults.length > 0 && (
            <ul role="listbox" className="py-1">
              {flatResults.map((result, index) => {
                const isActive = index === activeIndex;
                const commonClass = `w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-gray-50 dark:hover:bg-neutral-800"
                }`;

                if (result.kind === "nav") {
                  return (
                    <li key={`nav-${result.item.id}`} role="option" aria-selected={isActive}>
                      <button
                        type="button"
                        className={commonClass}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => navigateToResult(result)}
                      >
                        <Search className="w-4 h-4 mt-0.5 shrink-0 opacity-60" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{result.item.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {result.item.category} · {result.item.subtitle}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                }

                const Icon =
                  result.kind === "customer"
                    ? User
                    : result.kind === "product"
                      ? Package
                      : Building2;

                const categoryLabel =
                  result.kind === "customer"
                    ? "Customer"
                    : result.kind === "product"
                      ? "Product"
                      : "Supplier";

                return (
                  <li
                    key={`${result.kind}-${result.id}`}
                    role="option"
                    aria-selected={isActive}
                  >
                    <button
                      type="button"
                      className={commonClass}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => navigateToResult(result)}
                    >
                      <Icon className="w-4 h-4 mt-0.5 shrink-0 opacity-60" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {categoryLabel} · {result.subtitle}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
