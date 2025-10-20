import { Injectable, signal, computed } from '@angular/core';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms';

export interface FormState {
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  errors: Record<string, string>;
  values: Record<string, any>;
}

export interface FormFieldState {
  value: any;
  valid: boolean;
  invalid: boolean;
  dirty: boolean;
  touched: boolean;
  error: string | null;
}

/**
 * FormStateService - 表單狀態管理服務
 * 使用 Angular Signals 統一管理表單狀態
 * 遵循單一職責原則：只負責表單狀態管理
 */
@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  // Form states registry
  private readonly _formStates = signal<Map<string, FormState>>(new Map());
  private readonly _fieldStates = signal<Map<string, Map<string, FormFieldState>>>(new Map());

  // Public readonly signals
  readonly formStates = this._formStates.asReadonly();
  readonly fieldStates = this._fieldStates.asReadonly();

  // Register a form
  registerForm(formId: string, form: FormGroup) {
    const initialState: FormState = {
      isValid: form.valid,
      isDirty: form.dirty,
      isTouched: form.touched,
      errors: this.extractFormErrors(form),
      values: form.value
    };

    this._formStates.update(states => {
      const newStates = new Map(states);
      newStates.set(formId, initialState);
      return newStates;
    });

    // Register field states
    this.registerFormFields(formId, form);

    // Subscribe to form changes
    form.valueChanges.subscribe(() => {
      this.updateFormState(formId, form);
    });

    form.statusChanges.subscribe(() => {
      this.updateFormState(formId, form);
    });
  }

  // Register form fields
  private registerFormFields(formId: string, form: FormGroup) {
    const fieldStates = new Map<string, FormFieldState>();
    
    Object.keys(form.controls).forEach(fieldName => {
      const control = form.get(fieldName);
      if (control) {
        const fieldState: FormFieldState = {
          value: control.value,
          valid: control.valid,
          invalid: control.invalid,
          dirty: control.dirty,
          touched: control.touched,
          error: this.getFieldError(control)
        };
        fieldStates.set(fieldName, fieldState);
      }
    });

    this._fieldStates.update(states => {
      const newStates = new Map(states);
      newStates.set(formId, fieldStates);
      return newStates;
    });
  }

  // Update form state
  private updateFormState(formId: string, form: FormGroup) {
    const updatedState: FormState = {
      isValid: form.valid,
      isDirty: form.dirty,
      isTouched: form.touched,
      errors: this.extractFormErrors(form),
      values: form.value
    };

    this._formStates.update(states => {
      const newStates = new Map(states);
      newStates.set(formId, updatedState);
      return newStates;
    });

    // Update field states
    this.updateFieldStates(formId, form);
  }

  // Update field states
  private updateFieldStates(formId: string, form: FormGroup) {
    const fieldStates = new Map<string, FormFieldState>();
    
    Object.keys(form.controls).forEach(fieldName => {
      const control = form.get(fieldName);
      if (control) {
        const fieldState: FormFieldState = {
          value: control.value,
          valid: control.valid,
          invalid: control.invalid,
          dirty: control.dirty,
          touched: control.touched,
          error: this.getFieldError(control)
        };
        fieldStates.set(fieldName, fieldState);
      }
    });

    this._fieldStates.update(states => {
      const newStates = new Map(states);
      newStates.set(formId, fieldStates);
      return newStates;
    });
  }

  // Get form state
  getFormState(formId: string): FormState | undefined {
    return this._formStates().get(formId);
  }

  // Get field state
  getFieldState(formId: string, fieldName: string): FormFieldState | undefined {
    const fieldStates = this._fieldStates().get(formId);
    return fieldStates?.get(fieldName);
  }

  // Computed signals for specific forms
  getFormValid(formId: string) {
    return computed(() => {
      const state = this._formStates().get(formId);
      return state?.isValid ?? false;
    });
  }

  getFormDirty(formId: string) {
    return computed(() => {
      const state = this._formStates().get(formId);
      return state?.isDirty ?? false;
    });
  }

  getFormTouched(formId: string) {
    return computed(() => {
      const state = this._formStates().get(formId);
      return state?.isTouched ?? false;
    });
  }

  getFormErrors(formId: string) {
    return computed(() => {
      const state = this._formStates().get(formId);
      return state?.errors ?? {};
    });
  }

  getFormValues(formId: string) {
    return computed(() => {
      const state = this._formStates().get(formId);
      return state?.values ?? {};
    });
  }

  // Field-specific computed signals
  getFieldValid(formId: string, fieldName: string) {
    return computed(() => {
      const fieldState = this.getFieldState(formId, fieldName);
      return fieldState?.valid ?? false;
    });
  }

  getFieldInvalid(formId: string, fieldName: string) {
    return computed(() => {
      const fieldState = this.getFieldState(formId, fieldName);
      return fieldState?.invalid ?? false;
    });
  }

  getFieldDirty(formId: string, fieldName: string) {
    return computed(() => {
      const fieldState = this.getFieldState(formId, fieldName);
      return fieldState?.dirty ?? false;
    });
  }

  getFieldTouched(formId: string, fieldName: string) {
    return computed(() => {
      const fieldState = this.getFieldState(formId, fieldName);
      return fieldState?.touched ?? false;
    });
  }

  getFieldErrorSignal(formId: string, fieldName: string) {
    return computed(() => {
      const fieldState = this.getFieldState(formId, fieldName);
      return fieldState?.error ?? null;
    });
  }

  getFieldValue(formId: string, fieldName: string) {
    return computed(() => {
      const fieldState = this.getFieldState(formId, fieldName);
      return fieldState?.value ?? null;
    });
  }

  // Utility methods
  private extractFormErrors(form: FormGroup): Record<string, string> {
    const errors: Record<string, string> = {};
    
    Object.keys(form.controls).forEach(fieldName => {
      const control = form.get(fieldName);
      if (control && control.errors && control.touched) {
        errors[fieldName] = this.getFieldError(control);
      }
    });
    
    return errors;
  }

  private getFieldError(control: AbstractControl): string {
    if (control.errors) {
      if (control.errors['required']) return '此欄位為必填';
      if (control.errors['minlength']) return `至少需要 ${control.errors['minlength'].requiredLength} 個字符`;
      if (control.errors['maxlength']) return `不能超過 ${control.errors['maxlength'].requiredLength} 個字符`;
      if (control.errors['pattern']) return '格式不正確';
      if (control.errors['email']) return '請輸入有效的電子郵件地址';
      if (control.errors['min']) return `最小值為 ${control.errors['min'].min}`;
      if (control.errors['max']) return `最大值為 ${control.errors['max'].max}`;
    }
    return '';
  }

  // Unregister form
  unregisterForm(formId: string) {
    this._formStates.update(states => {
      const newStates = new Map(states);
      newStates.delete(formId);
      return newStates;
    });

    this._fieldStates.update(states => {
      const newStates = new Map(states);
      newStates.delete(formId);
      return newStates;
    });
  }

  // Clear all states
  clearAll() {
    this._formStates.set(new Map());
    this._fieldStates.set(new Map());
  }
}
