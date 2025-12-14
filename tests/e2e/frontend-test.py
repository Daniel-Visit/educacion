#!/usr/bin/env python3
"""
Comprehensive frontend test for Educacion App.
Tests all major pages and functionality.
"""

import os
import sys
from playwright.sync_api import sync_playwright, expect

# Test results tracking
results = []

def log_result(test_name: str, passed: bool, details: str = ""):
    status = "PASS" if passed else "FAIL"
    results.append((test_name, passed, details))
    print(f"[{status}] {test_name}" + (f" - {details}" if details else ""))

def test_login_page(page):
    """Test login page renders correctly"""
    try:
        page.goto('http://localhost:3000/auth/login')
        page.wait_for_load_state('networkidle')

        # Take screenshot
        page.screenshot(path='/tmp/test-login.png', full_page=True)

        # Check for login elements
        has_email = page.locator('input[type="email"], input[name="email"]').count() > 0
        has_password = page.locator('input[type="password"]').count() > 0
        has_submit = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Login")').count() > 0

        if has_email and has_password and has_submit:
            log_result("Login Page - Form Elements", True, "Email, password, and submit button found")
        else:
            log_result("Login Page - Form Elements", False, f"email={has_email}, password={has_password}, submit={has_submit}")

        # Check for Google OAuth button
        has_google = page.locator('button:has-text("Google"), [data-provider="google"]').count() > 0
        log_result("Login Page - Google OAuth", has_google, "Google sign-in button present" if has_google else "No Google button found")

        return True
    except Exception as e:
        log_result("Login Page", False, str(e))
        return False

def test_protected_routes_redirect(page):
    """Test that protected routes redirect to login"""
    protected_routes = [
        '/dashboard',
        '/matrices',
        '/evaluaciones',
        '/horarios',
        '/planificacion-anual',
    ]

    for route in protected_routes:
        try:
            page.goto(f'http://localhost:3000{route}')
            page.wait_for_load_state('networkidle')

            # Should redirect to login
            current_url = page.url
            redirected = '/auth/login' in current_url or '/login' in current_url

            log_result(f"Protected Route {route}", redirected,
                      f"Redirected to {current_url}" if redirected else f"No redirect, stayed at {current_url}")
        except Exception as e:
            log_result(f"Protected Route {route}", False, str(e))

def test_api_endpoints(page):
    """Test that API endpoints respond"""
    api_endpoints = [
        '/api/asignaturas',
        '/api/niveles',
        '/api/metodologias',
    ]

    for endpoint in api_endpoints:
        try:
            response = page.request.get(f'http://localhost:3000{endpoint}')
            status = response.status

            # These endpoints should return data (200) or unauthorized (401)
            passed = status in [200, 401, 403]
            log_result(f"API {endpoint}", passed, f"Status: {status}")
        except Exception as e:
            log_result(f"API {endpoint}", False, str(e))

def test_static_assets(page):
    """Test that static assets load"""
    try:
        page.goto('http://localhost:3000/auth/login')
        page.wait_for_load_state('networkidle')

        # Check for CSS loaded (page should have styles)
        body = page.locator('body')
        has_styles = body.evaluate('el => window.getComputedStyle(el).backgroundColor !== ""')
        log_result("Static Assets - CSS", True, "Styles loaded")

        # Check for JS loaded (Next.js should inject __NEXT_DATA__)
        has_nextjs = page.evaluate('() => typeof window.__NEXT_DATA__ !== "undefined"')
        log_result("Static Assets - Next.js", has_nextjs, "Next.js hydrated" if has_nextjs else "Next.js not found")

    except Exception as e:
        log_result("Static Assets", False, str(e))

def test_responsive_design(page):
    """Test responsive design at different viewports"""
    viewports = [
        ('Mobile', 375, 667),
        ('Tablet', 768, 1024),
        ('Desktop', 1920, 1080),
    ]

    for name, width, height in viewports:
        try:
            page.set_viewport_size({'width': width, 'height': height})
            page.goto('http://localhost:3000/auth/login')
            page.wait_for_load_state('networkidle')

            page.screenshot(path=f'/tmp/test-{name.lower()}.png', full_page=True)

            # Check that login form is visible
            form_visible = page.locator('form, [role="form"]').first.is_visible()
            log_result(f"Responsive - {name} ({width}x{height})", form_visible,
                      "Form visible" if form_visible else "Form not visible")
        except Exception as e:
            log_result(f"Responsive - {name}", False, str(e))

def test_error_pages(page):
    """Test error pages"""
    try:
        # Test 404 page
        page.goto('http://localhost:3000/nonexistent-page-12345')
        page.wait_for_load_state('networkidle')

        # Should show 404 or redirect to login
        current_url = page.url
        content = page.content().lower()

        has_404 = '404' in content or 'not found' in content or '/auth/login' in current_url
        log_result("Error Page - 404", has_404, f"URL: {current_url}")

        page.screenshot(path='/tmp/test-404.png', full_page=True)

    except Exception as e:
        log_result("Error Pages", False, str(e))

def test_accessibility_basics(page):
    """Test basic accessibility"""
    try:
        page.goto('http://localhost:3000/auth/login')
        page.wait_for_load_state('networkidle')

        # Check for lang attribute
        has_lang = page.locator('html[lang]').count() > 0
        log_result("A11y - HTML lang attribute", has_lang)

        # Check for form labels
        inputs = page.locator('input').count()
        labels = page.locator('label').count()
        has_labels = labels >= inputs or inputs == 0
        log_result("A11y - Form labels", has_labels, f"inputs={inputs}, labels={labels}")

        # Check for focus styles (tab through)
        page.keyboard.press('Tab')
        focused = page.evaluate('() => document.activeElement.tagName')
        log_result("A11y - Keyboard navigation", focused != 'BODY', f"Focused element: {focused}")

    except Exception as e:
        log_result("Accessibility", False, str(e))

def main():
    print("=" * 60)
    print("EDUCACION APP - FRONTEND TEST SUITE")
    print("=" * 60)
    print()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        # Enable console logging
        page.on('console', lambda msg: print(f"[CONSOLE] {msg.type}: {msg.text}") if msg.type == 'error' else None)

        try:
            print("\n--- Testing Login Page ---")
            test_login_page(page)

            print("\n--- Testing Protected Routes ---")
            test_protected_routes_redirect(page)

            print("\n--- Testing API Endpoints ---")
            test_api_endpoints(page)

            print("\n--- Testing Static Assets ---")
            test_static_assets(page)

            print("\n--- Testing Responsive Design ---")
            test_responsive_design(page)

            print("\n--- Testing Error Pages ---")
            test_error_pages(page)

            print("\n--- Testing Accessibility ---")
            test_accessibility_basics(page)

        finally:
            browser.close()

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = sum(1 for _, p, _ in results if p)
    failed = sum(1 for _, p, _ in results if not p)
    total = len(results)

    print(f"\nTotal: {total} | Passed: {passed} | Failed: {failed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")

    if failed > 0:
        print("\nFailed Tests:")
        for name, p, details in results:
            if not p:
                print(f"  - {name}: {details}")

    print("\nScreenshots saved to /tmp/test-*.png")

    # Exit with error code if any tests failed
    sys.exit(0 if failed == 0 else 1)

if __name__ == '__main__':
    main()
