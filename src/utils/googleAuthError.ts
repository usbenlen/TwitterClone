import { ApiError } from "@/api/httpClient";

export function googleAuthError(error: unknown, isLinking: boolean): string {
  if (error instanceof ApiError) {
    if (error.status === 409)
      return isLinking
        ? "Цей акаунт або обраний Google уже має іншу прив’язку."
        : "Акаунт із цією поштою вже існує. Увійдіть за допомогою пароля та прив’яжіть Google у налаштуваннях.";
    if (error.status === 401) return "Не вдалося підтвердити вхід через Google. Спробуйте ще раз.";
    if (error.status === 429) return "Забагато спроб. Зачекайте трохи та спробуйте ще раз.";
    if (
      error.status === 400 &&
      error.message ===
        "Register and verify this email first, then link Google from your account."
    )
      return "Зареєструйтеся та підтвердьте цю пошту, а потім прив’яжіть Google у налаштуваннях.";
    return error.message;
  }
  return isLinking
    ? "Не вдалося прив’язати Google. Спробуйте ще раз."
    : "Не вдалося увійти через Google. Спробуйте ще раз.";
}
