export interface FormspreePayload {
  [key: string]: any;
}

export async function submitToFormspree(
  endpointUrl: string,
  payload: FormspreePayload
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.errors?.map((e: any) => e.message).join(', ') || 
        errorData?.error || 'Formspree 서버 응답 오류가 발생했습니다.';
      return { success: false, message: errorMsg };
    }
  } catch (error: any) {
    console.error('Formspree transmission error:', error);
    return { 
      success: false, 
      message: error?.message || '네트워크 연결 상태를 확인해 주세요.' 
    };
  }
}
