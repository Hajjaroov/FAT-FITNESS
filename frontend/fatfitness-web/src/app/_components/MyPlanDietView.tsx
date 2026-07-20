"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/app/_components/PageShell";
import { FoodCombobox } from "@/app/_components/FoodCombobox";
import { IconFlag, IconPencil, IconPlus, IconXMark, IconChevronDown, IconChevronUp } from "@/app/_components/icons";
import { useAuth } from "@/app/_components/AuthProvider";
import { useLocalizedContent } from "@/app/_components/LocaleProvider";
import { myPlanCopy } from "@/content/myplan";
import { siteCopy } from "@/content/site";
import {
  addDietMeal,
  addDietMealItem,
  ApiError,
  deleteDietMeal,
  deleteDietMealItem,
  getDietMeals,
  getFoods,
  reorderDietMeals,
  submitMacroCheck,
  updateDietMeal,
  updateDietMealItem,
} from "@/lib/api";
import type { DietMeal, DietMealItem, Food } from "@/types/diet";

type Totals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const zeroTotals: Totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };

function itemTotals(item: DietMealItem): Totals {
  return {
    calories: item.quantity * item.caloriesPerUnit,
    protein: item.quantity * item.proteinPerUnit,
    carbs: item.quantity * item.carbsPerUnit,
    fat: item.quantity * item.fatPerUnit,
  };
}

function addTotals(a: Totals, b: Totals): Totals {
  return {
    calories: a.calories + b.calories,
    protein: a.protein + b.protein,
    carbs: a.carbs + b.carbs,
    fat: a.fat + b.fat,
  };
}

function mealTotals(meal: DietMeal): Totals {
  return meal.items.reduce((acc, item) => addTotals(acc, itemTotals(item)), zeroTotals);
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function formatTotals(totals: Totals, unit: string) {
  return `${round1(totals.calories)} ${unit} | ${round1(totals.protein)}g P | ${round1(totals.carbs)}g C | ${round1(totals.fat)}g F`;
}

export function MyPlanDietView() {
  const copy = useLocalizedContent(myPlanCopy);
  const site = useLocalizedContent(siteCopy);
  const router = useRouter();
  const { status, accessToken } = useAuth();

  const [meals, setMeals] = useState<DietMeal[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [mealActionError, setMealActionError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "checking" && !accessToken) {
      router.replace("/login");
    }
  }, [status, accessToken, router]);

  useEffect(() => {
    if (!accessToken) return;

    let isActive = true;

    Promise.all([getDietMeals(accessToken), getFoods(accessToken)])
      .then(([mealList, foodList]) => {
        if (!isActive) return;
        setMeals(mealList);
        setFoods(foodList);
      })
      .catch(() => {
        if (isActive) setLoadError(copy.diet.loadError);
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, copy.diet.loadError]);

  const dayTotal = useMemo(
    () => meals.reduce((acc, meal) => addTotals(acc, mealTotals(meal)), zeroTotals),
    [meals],
  );

  async function handleAddMeal() {
    if (!accessToken) return;
    setIsAddingMeal(true);
    setMealActionError(null);
    try {
      const meal = await addDietMeal(undefined, accessToken);
      setMeals((prev) => [...prev, meal]);
    } catch {
      setMealActionError(copy.diet.mealAddError);
    } finally {
      setIsAddingMeal(false);
    }
  }

  async function handleRenameMeal(mealId: string, title: string) {
    if (!accessToken) return;
    try {
      const updated = await updateDietMeal(mealId, title, accessToken);
      setMeals((prev) => prev.map((m) => (m.id === mealId ? { ...m, title: updated.title } : m)));
    } catch {
      setMealActionError(copy.diet.mealRenameError);
    }
  }

  async function handleDeleteMeal(mealId: string) {
    if (!accessToken) return;
    if (!window.confirm(copy.diet.deleteMealConfirm)) return;
    try {
      await deleteDietMeal(mealId, accessToken);
      setMeals((prev) => prev.filter((m) => m.id !== mealId));
    } catch {
      setMealActionError(copy.diet.mealDeleteError);
    }
  }

  async function handleMoveMeal(mealId: string, direction: -1 | 1) {
    if (!accessToken) return;
    const index = meals.findIndex((m) => m.id === mealId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= meals.length) return;

    const previousMeals = meals;
    const reordered = [...meals];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    setMeals(reordered);

    try {
      const updated = await reorderDietMeals(
        reordered.map((m) => m.id),
        accessToken,
      );
      setMeals(updated);
    } catch {
      setMeals(previousMeals);
      setMealActionError(copy.diet.mealReorderError);
    }
  }

  function handleItemAdded(mealId: string, item: DietMealItem) {
    setMeals((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, items: [...m.items, item] } : m)),
    );
  }

  async function refetchFoods() {
    if (!accessToken) return;
    try {
      const foodList = await getFoods(accessToken);
      setFoods(foodList);
    } catch {
      // Best-effort: the newly added/reused food simply stays out of local
      // suggestions until the next full page load.
    }
  }

  function handleItemUpdated(mealId: string, item: DietMealItem) {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId
          ? { ...m, items: m.items.map((existing) => (existing.id === item.id ? item : existing)) }
          : m,
      ),
    );
  }

  function handleItemDeleted(mealId: string, itemId: string) {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId ? { ...m, items: m.items.filter((existing) => existing.id !== itemId) } : m,
      ),
    );
  }

  if (status === "checking" || !accessToken) {
    return null;
  }

  return (
    <PageShell>
      <Link href="/myplan" className="site-text-link mb-8">
        {site.links.backToMyPlan}
      </Link>

      <section className="max-w-3xl">
        <p className="site-kicker">{copy.diet.pageEyebrow}</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
          {copy.diet.myDietTitle}
        </h1>
        <p className="site-muted mt-6 text-base leading-8">{copy.diet.pageIntro}</p>
      </section>

      {loadError ? (
        <p className="mt-6 text-sm text-red-800 dark:text-red-300">{loadError}</p>
      ) : null}

      <section className="site-divider mt-12 border-y">
        <div className="grid gap-0 sm:grid-cols-4">
          {[
            { label: copy.diet.dayTotalCaloriesLabel, value: `${round1(dayTotal.calories)} ${copy.diet.caloriesUnit}` },
            { label: copy.diet.dayTotalProteinLabel, value: `${round1(dayTotal.protein)} g` },
            { label: copy.diet.dayTotalCarbsLabel, value: `${round1(dayTotal.carbs)} g` },
            { label: copy.diet.dayTotalFatLabel, value: `${round1(dayTotal.fat)} g` },
          ].map((total) => (
            <div
              key={total.label}
              className="site-divider flex items-baseline justify-between gap-4 border-b py-4 sm:block sm:border-b-0 sm:border-r sm:py-5 sm:text-center sm:last:border-r-0"
            >
              <p className="site-subtle text-sm">{total.label}</p>
              <p className="text-2xl font-semibold sm:mt-1">{total.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="site-divider mt-10 border-t pt-8">
        <div className="flex flex-wrap items-center justify-end gap-4">
          <button
            type="button"
            disabled={isAddingMeal}
            onClick={() => void handleAddMeal()}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            <IconPlus />
            {copy.diet.addMealLabel}
          </button>
        </div>

        {mealActionError ? (
          <p className="mt-3 text-sm text-red-800 dark:text-red-300">{mealActionError}</p>
        ) : null}

        {meals.length === 0 ? (
          <p className="site-muted mt-6 text-sm">{copy.diet.emptyMealsText}</p>
        ) : (
          <div className="mt-6 grid gap-6">
            {meals.map((meal, index) => (
              <DietMealCard
                key={meal.id}
                meal={meal}
                foods={foods}
                accessToken={accessToken}
                copy={copy.diet}
                isFirst={index === 0}
                isLast={index === meals.length - 1}
                onRename={(title) => handleRenameMeal(meal.id, title)}
                onDelete={() => handleDeleteMeal(meal.id)}
                onMove={(direction) => handleMoveMeal(meal.id, direction)}
                onItemAdded={(item) => handleItemAdded(meal.id, item)}
                onFoodsRefetchNeeded={refetchFoods}
                onItemUpdated={(item) => handleItemUpdated(meal.id, item)}
                onItemDeleted={(itemId) => handleItemDeleted(meal.id, itemId)}
              />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

type DietCopy = typeof myPlanCopy.en.diet;

function DietMealCard({
  meal,
  foods,
  accessToken,
  copy,
  isFirst,
  isLast,
  onRename,
  onDelete,
  onMove,
  onItemAdded,
  onFoodsRefetchNeeded,
  onItemUpdated,
  onItemDeleted,
}: {
  meal: DietMeal;
  foods: Food[];
  accessToken: string;
  copy: DietCopy;
  isFirst: boolean;
  isLast: boolean;
  onRename: (title: string) => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
  onItemAdded: (item: DietMealItem) => void;
  onFoodsRefetchNeeded: () => Promise<void>;
  onItemUpdated: (item: DietMealItem) => void;
  onItemDeleted: (itemId: string) => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [titleInput, setTitleInput] = useState(meal.title);
  const subtotal = mealTotals(meal);

  return (
    <article className="rounded-xl border border-(--color-border) p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (titleInput.trim()) {
                  onRename(titleInput.trim());
                }
                setIsRenaming(false);
              }}
              className="flex flex-wrap items-center gap-2"
            >
              <label htmlFor={`meal-title-${meal.id}`} className="sr-only">
                {copy.mealTitleLabel}
              </label>
              <input
                id={`meal-title-${meal.id}`}
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                autoFocus
                className="min-h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-lg font-semibold text-foreground outline-none focus:border-(--color-accent)"
              />
              <button
                type="submit"
                className="min-h-10 rounded-xl border border-(--color-border) bg-foreground px-4 text-sm font-semibold text-background transition hover:opacity-90"
              >
                {copy.saveLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTitleInput(meal.title);
                  setIsRenaming(false);
                }}
                className="min-h-10 rounded-xl border border-(--color-border) bg-background px-4 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
              >
                {copy.cancelLabel}
              </button>
            </form>
          ) : (
            <h3 className="text-xl font-semibold">{meal.title}</h3>
          )}
          <p className="site-muted mt-1 text-sm">
            {copy.mealSubtotalLabel}: {formatTotals(subtotal, copy.caloriesUnit)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isFirst}
            onClick={() => onMove(-1)}
            aria-label={copy.moveUpLabel}
            className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-(--color-border) bg-background text-foreground transition hover:border-(--color-border-strong) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconChevronUp />
          </button>
          <button
            type="button"
            disabled={isLast}
            onClick={() => onMove(1)}
            aria-label={copy.moveDownLabel}
            className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-(--color-border) bg-background text-foreground transition hover:border-(--color-border-strong) disabled:cursor-not-allowed disabled:opacity-40"
          >
            <IconChevronDown />
          </button>
          {!isRenaming ? (
            <button
              type="button"
              onClick={() => setIsRenaming(true)}
              aria-label={copy.renameMealLabel}
              className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-(--color-border) bg-background text-foreground transition hover:border-(--color-border-strong)"
            >
              <IconPencil />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDelete}
            aria-label={copy.deleteMealLabel}
            className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-(--color-border) bg-background text-foreground transition hover:border-(--color-border-strong)"
          >
            <IconXMark />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        {meal.items.length === 0 ? (
          <p className="site-muted text-sm">{copy.emptyMealItemsText}</p>
        ) : (
          meal.items.map((item) => (
            <DietMealItemRow
              key={item.id}
              mealId={meal.id}
              item={item}
              foods={foods}
              accessToken={accessToken}
              copy={copy}
              onUpdated={onItemUpdated}
              onDeleted={() => onItemDeleted(item.id)}
            />
          ))
        )}
      </div>

      <div className="mt-5">
        <AddFoodToMealRow
          mealId={meal.id}
          foods={foods}
          accessToken={accessToken}
          copy={copy}
          onAdded={onItemAdded}
          onFoodsRefetchNeeded={onFoodsRefetchNeeded}
        />
      </div>
    </article>
  );
}

function DietMealItemRow({
  mealId,
  item,
  foods,
  accessToken,
  copy,
  onUpdated,
  onDeleted,
}: {
  mealId: string;
  item: DietMealItem;
  foods: Food[];
  accessToken: string;
  copy: DietCopy;
  onUpdated: (item: DietMealItem) => void;
  onDeleted: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);
  const [quantityInput, setQuantityInput] = useState(String(item.quantity));
  const [error, setError] = useState<string | null>(null);
  const totals = itemTotals(item);
  const linkedFood = item.foodId ? foods.find((f) => f.id === item.foodId) ?? null : null;

  async function handleSaveQuantity() {
    const quantity = parseFloat(quantityInput);
    if (!Number.isFinite(quantity) || quantity <= 0) return;

    try {
      const updated = await updateDietMealItem(
        mealId,
        item.id,
        {
          name: item.name,
          unitLabel: item.unitLabel ?? undefined,
          quantity,
          caloriesPerUnit: item.caloriesPerUnit,
          proteinPerUnit: item.proteinPerUnit,
          carbsPerUnit: item.carbsPerUnit,
          fatPerUnit: item.fatPerUnit,
        },
        accessToken,
      );
      onUpdated(updated);
      setIsEditing(false);
    } catch {
      setError(copy.itemUpdateError);
    }
  }

  async function handleDelete() {
    if (!window.confirm(copy.deleteItemConfirm)) return;
    try {
      await deleteDietMealItem(mealId, item.id, accessToken);
      onDeleted();
    } catch {
      setError(copy.itemDeleteError);
    }
  }

  return (
    <div className="rounded-xl border border-(--color-border) px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">{item.name}</p>
          <p className="site-muted text-xs">
            {item.quantity} × {item.unitLabel ?? ""} — {formatTotals(totals, copy.caloriesUnit)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isEditing ? (
            <>
              <label htmlFor={`qty-${item.id}`} className="sr-only">
                {copy.quantityLabel}
              </label>
              <input
                id={`qty-${item.id}`}
                type="number"
                step="0.01"
                min="0.01"
                value={quantityInput}
                onChange={(e) => setQuantityInput(e.target.value)}
                className="w-20 rounded-xl border border-(--color-border) bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-(--color-accent)"
              />
              <button
                type="button"
                onClick={() => void handleSaveQuantity()}
                className="min-h-9 rounded-xl border border-(--color-border) bg-foreground px-3 text-xs font-semibold text-background transition hover:opacity-90"
              >
                {copy.saveLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuantityInput(String(item.quantity));
                  setIsEditing(false);
                }}
                className="min-h-9 rounded-xl border border-(--color-border) bg-background px-3 text-xs font-semibold text-foreground transition hover:border-(--color-border-strong)"
              >
                {copy.cancelLabel}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label={copy.editLabel}
              className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-(--color-border) bg-background text-foreground transition hover:border-(--color-border-strong)"
            >
              <IconPencil />
            </button>
          )}
          {linkedFood ? (
            <button
              type="button"
              onClick={() => setIsFlagging(true)}
              aria-label={copy.flagLabel}
              className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-100 text-amber-900 transition hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-200"
            >
              <IconFlag />
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => void handleDelete()}
            aria-label={copy.deleteLabel}
            className="flex min-h-9 min-w-9 items-center justify-center rounded-xl border border-(--color-border) bg-background text-foreground transition hover:border-(--color-border-strong)"
          >
            <IconXMark />
          </button>
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-red-800 dark:text-red-300">{error}</p> : null}

      {isFlagging && linkedFood ? (
        <FlagFoodModal
          food={linkedFood}
          accessToken={accessToken}
          copy={copy}
          onClose={() => setIsFlagging(false)}
        />
      ) : null}
    </div>
  );
}

function AddFoodToMealRow({
  mealId,
  foods,
  accessToken,
  copy,
  onAdded,
  onFoodsRefetchNeeded,
}: {
  mealId: string;
  foods: Food[];
  accessToken: string;
  copy: DietCopy;
  onAdded: (item: DietMealItem) => void;
  onFoodsRefetchNeeded: () => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [nameDe, setNameDe] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [unitLabel, setUnitLabel] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quantityValue = parseFloat(quantity) || 0;
  const previewTotals: Totals = {
    calories: quantityValue * (parseFloat(calories) || 0),
    protein: quantityValue * (parseFloat(protein) || 0),
    carbs: quantityValue * (parseFloat(carbs) || 0),
    fat: quantityValue * (parseFloat(fat) || 0),
  };

  function handleSelectFood(food: Food) {
    setSelectedFood(food);
    setName(food.name);
    setNameDe(food.nameDe ?? "");
    setUnitLabel(food.unitLabel);
    setCalories(String(food.caloriesPerUnit));
    setProtein(String(food.proteinPerUnit));
    setCarbs(String(food.carbsPerUnit));
    setFat(String(food.fatPerUnit));
  }

  function resetForm() {
    setName("");
    setNameDe("");
    setSelectedFood(null);
    setUnitLabel("");
    setQuantity("1");
    setCalories("");
    setProtein("");
    setCarbs("");
    setFat("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qty = parseFloat(quantity);
    const cal = parseFloat(calories);
    const pro = parseFloat(protein);
    const carb = parseFloat(carbs);
    const ft = parseFloat(fat);
    if (!name.trim() || !Number.isFinite(qty) || qty <= 0) return;
    if (![cal, pro, carb, ft].every(Number.isFinite)) return;

    setIsSaving(true);
    setError(null);
    try {
      const item = await addDietMealItem(
        mealId,
        {
          foodId: selectedFood?.id,
          name: name.trim(),
          nameDe: nameDe.trim() || undefined,
          unitLabel: unitLabel.trim() || undefined,
          quantity: qty,
          caloriesPerUnit: cal,
          proteinPerUnit: pro,
          carbsPerUnit: carb,
          fatPerUnit: ft,
        },
        accessToken,
      );
      if (!selectedFood && item.foodId && !foods.some((f) => f.id === item.foodId)) {
        // The server may have created a brand-new food, or silently reused an
        // existing catalog entry (dedup by name+unit) that isn't in our locally
        // loaded list. Either way, re-fetch the real catalog row instead of
        // fabricating one from the user's typed macros, which may not match it.
        await onFoodsRefetchNeeded();
      }
      onAdded(item);
      resetForm();
    } catch {
      setError(copy.itemAddError);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-(--color-border) bg-background p-4 text-sm font-semibold text-(--color-muted) transition hover:border-(--color-border-strong) hover:text-foreground"
      >
        <IconPlus />
        {copy.addFoodLabel}
      </button>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="rounded-xl border border-dashed border-(--color-border) bg-background p-4">
      <p className="site-subtle text-xs font-bold uppercase tracking-[0.14em]">{copy.addFoodLabel}</p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`food-search-${mealId}`} className="text-sm font-semibold">
            {copy.nameLabel}
          </label>
          <div className="mt-2">
            <FoodCombobox
              id={`food-search-${mealId}`}
              value={name}
              onValueChange={(value) => {
                setName(value);
                setSelectedFood(null);
              }}
              onSelectFood={handleSelectFood}
              foods={foods}
              placeholder={copy.searchPlaceholder}
              searchHint={copy.searchHint}
              noResultsLabel={copy.noResultsLabel}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor={`food-name-de-${mealId}`} className="text-sm font-semibold">
            {copy.nameDeLabel}
          </label>
          <input
            id={`food-name-de-${mealId}`}
            value={nameDe}
            onChange={(e) => setNameDe(e.target.value)}
            placeholder={copy.nameDePlaceholder}
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
          <p className="site-muted mt-1 text-xs">{copy.nameDeHint}</p>
        </div>

        <div>
          <label htmlFor={`unit-${mealId}`} className="text-sm font-semibold">
            {copy.unitLabelLabel}
          </label>
          <input
            id={`unit-${mealId}`}
            value={unitLabel}
            onChange={(e) => setUnitLabel(e.target.value)}
            placeholder={copy.unitLabelPlaceholder}
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
        </div>

        <div>
          <label htmlFor={`qty-new-${mealId}`} className="text-sm font-semibold">
            {copy.quantityLabel}
          </label>
          <input
            id={`qty-new-${mealId}`}
            type="number"
            step="0.01"
            min="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
        </div>

        <div>
          <label htmlFor={`cal-${mealId}`} className="text-sm font-semibold">
            {copy.caloriesLabel}
          </label>
          <input
            id={`cal-${mealId}`}
            type="number"
            step="0.1"
            min="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            required
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
        </div>
        <div>
          <label htmlFor={`protein-${mealId}`} className="text-sm font-semibold">
            {copy.proteinLabel}
          </label>
          <input
            id={`protein-${mealId}`}
            type="number"
            step="0.1"
            min="0"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            required
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
        </div>
        <div>
          <label htmlFor={`carbs-${mealId}`} className="text-sm font-semibold">
            {copy.carbsLabel}
          </label>
          <input
            id={`carbs-${mealId}`}
            type="number"
            step="0.1"
            min="0"
            value={carbs}
            onChange={(e) => setCarbs(e.target.value)}
            required
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
        </div>
        <div>
          <label htmlFor={`fat-${mealId}`} className="text-sm font-semibold">
            {copy.fatLabel}
          </label>
          <input
            id={`fat-${mealId}`}
            type="number"
            step="0.1"
            min="0"
            value={fat}
            onChange={(e) => setFat(e.target.value)}
            required
            className="mt-2 min-h-11 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 text-sm text-foreground outline-none focus:border-(--color-accent)"
          />
        </div>
      </div>

      {name && (calories || protein || carbs || fat) ? (
        <p className="site-muted mt-3 text-xs">= {formatTotals(previewTotals, copy.caloriesUnit)}</p>
      ) : null}

      {error ? <p className="mt-3 text-xs text-red-800 dark:text-red-300">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={isSaving}
          className="min-h-10 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
        >
          {isSaving ? copy.savingLabel : copy.addFoodLabel}
        </button>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsOpen(false);
          }}
          className="min-h-10 rounded-xl border border-(--color-border) bg-background px-5 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
        >
          {copy.cancelLabel}
        </button>
      </div>
    </form>
  );
}

function FlagFoodModal({
  food,
  accessToken,
  copy,
  onClose,
}: {
  food: Food;
  accessToken: string;
  copy: DietCopy;
  onClose: () => void;
}) {
  const [proposedName, setProposedName] = useState(food.name);
  const [proposedUnitLabel, setProposedUnitLabel] = useState(food.unitLabel);
  const [calories, setCalories] = useState(String(food.caloriesPerUnit));
  const [protein, setProtein] = useState(String(food.proteinPerUnit));
  const [carbs, setCarbs] = useState(String(food.carbsPerUnit));
  const [fat, setFat] = useState(String(food.fatPerUnit));
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cal = parseFloat(calories);
    const pro = parseFloat(protein);
    const carb = parseFloat(carbs);
    const ft = parseFloat(fat);
    if (![cal, pro, carb, ft].every(Number.isFinite)) {
      setError(copy.flagInvalidMacrosError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await submitMacroCheck(
        {
          targetFoodId: food.id,
          proposedName: proposedName.trim() || undefined,
          proposedUnitLabel: proposedUnitLabel.trim() || undefined,
          proposedCaloriesPerUnit: cal,
          proposedProteinPerUnit: pro,
          proposedCarbsPerUnit: carb,
          proposedFatPerUnit: ft,
          comment: comment.trim() || undefined,
        },
        accessToken,
      );
      setSubmitted(true);
    } catch (err) {
      const isDuplicate = err instanceof ApiError && err.status === 409;
      setError(isDuplicate ? copy.flagDuplicateError : copy.flagErrorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="site-card w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold">{copy.flagModalTitle}</h3>

        {submitted ? (
          <>
            <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-400">
              {copy.flagSubmittedMessage}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 min-h-10 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90"
            >
              {copy.cancelLabel}
            </button>
          </>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)}>
            <p className="site-subtle mt-4 text-xs font-bold uppercase tracking-[0.14em]">
              {copy.flagCurrentValuesLabel}
            </p>
            <p className="site-muted mt-1 text-sm">
              {food.name} ({food.unitLabel}) — {food.caloriesPerUnit} {copy.caloriesUnit} |{" "}
              {food.proteinPerUnit}g P | {food.carbsPerUnit}g C | {food.fatPerUnit}g F
            </p>

            <p className="site-subtle mt-4 text-xs font-bold uppercase tracking-[0.14em]">
              {copy.flagProposedValuesLabel}
            </p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <input
                value={proposedName}
                onChange={(e) => setProposedName(e.target.value)}
                placeholder={copy.nameLabel}
                className="min-h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-sm text-foreground outline-none focus:border-(--color-accent) sm:col-span-2"
              />
              <input
                value={proposedUnitLabel}
                onChange={(e) => setProposedUnitLabel(e.target.value)}
                placeholder={copy.unitLabelLabel}
                className="min-h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-sm text-foreground outline-none focus:border-(--color-accent) sm:col-span-2"
              />
              <input
                type="number"
                step="0.1"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder={copy.caloriesLabel}
                className="min-h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
              />
              <input
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder={copy.proteinLabel}
                className="min-h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
              />
              <input
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder={copy.carbsLabel}
                className="min-h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
              />
              <input
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                placeholder={copy.fatLabel}
                className="min-h-10 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
              />
            </div>

            <label htmlFor="flag-comment" className="mt-4 block text-sm font-semibold">
              {copy.flagCommentLabel}
            </label>
            <textarea
              id="flag-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={copy.flagCommentPlaceholder}
              rows={3}
              maxLength={1000}
              className="mt-2 w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-3 text-sm text-foreground outline-none focus:border-(--color-accent)"
            />

            {error ? <p className="mt-3 text-sm text-red-800 dark:text-red-300">{error}</p> : null}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="min-h-10 rounded-xl border border-(--color-border) bg-foreground px-5 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              >
                {isSubmitting ? copy.savingLabel : copy.flagSubmitLabel}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="min-h-10 rounded-xl border border-(--color-border) bg-background px-5 text-sm font-semibold text-foreground transition hover:border-(--color-border-strong)"
              >
                {copy.cancelLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
