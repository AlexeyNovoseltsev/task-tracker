from playwright.sync_api import sync_playwright, Page, expect
import time

def take_screenshots(page: Page):
    """
    Navigates through the app and takes screenshots of key pages.
    """
    print("Navigating to Dashboard...")
    page.goto("http://localhost:1420/")
    page.wait_for_selector('h1:has-text("Дашборд")', timeout=15000)
    time.sleep(2) # Wait for animations and data to settle
    page.screenshot(path="jules-scratch/verification/01_dashboard.png")
    print("Screenshot of Dashboard taken.")

    print("Navigating to Backlog...")
    page.get_by_role("link", name="Бэклог").click()
    page.wait_for_selector('h1:has-text("Бэклог продукта")', timeout=15000)
    page.screenshot(path="jules-scratch/verification/02_backlog.png")
    print("Screenshot of Backlog taken.")

    print("Navigating to Kanban...")
    page.get_by_role("link", name="Канбан").click()
    page.wait_for_selector('h1:has-text("Канбан-доска")', timeout=15000)
    # Drag and drop a task
    try:
        todo_column_selector = 'div.space-y-3'
        page.wait_for_selector(todo_column_selector)

        todo_column = page.locator(todo_column_selector).nth(0)
        in_progress_column = page.locator(todo_column_selector).nth(1)

        first_task = todo_column.locator("> div").first

        if first_task:
            print("Attempting to drag task...")
            start_box = first_task.bounding_box()
            end_box = in_progress_column.bounding_box()

            if start_box and end_box:
                page.mouse.move(start_box['x'] + start_box['width'] / 2, start_box['y'] + start_box['height'] / 2)
                page.mouse.down()
                page.mouse.move(end_box['x'] + end_box['width'] / 2, end_box['y'] + end_box['height'] / 2)
                page.mouse.up()
                print("Drag and drop completed.")
            else:
                print("Could not get bounding box for drag operation.")
        else:
            print("No task found to drag.")

    except Exception as e:
        print(f"An error occurred during drag and drop: {e}")

    time.sleep(1) # Wait for state update
    page.screenshot(path="jules-scratch/verification/03_kanban.png")
    print("Screenshot of Kanban taken.")

    print("Navigating to Sprints...")
    page.get_by_role("link", name="Спринты").click()
    page.wait_for_selector('h1:has-text("Управление спринтами")', timeout=15000)
    page.screenshot(path="jules-scratch/verification/04_sprints.png")
    print("Screenshot of Sprints taken.")

    print("Navigating to Analytics...")
    page.get_by_role("link", name="Аналитика").click()
    page.wait_for_selector('h1:has-text("Аналитика и отчеты")', timeout=15000)
    time.sleep(1) # Wait for charts to render
    page.screenshot(path="jules-scratch/verification/05_analytics.png")
    print("Screenshot of Analytics taken.")

    print("Navigating to Settings...")
    page.get_by_role("link", name="Настройки").click()
    page.wait_for_selector('h1:has-text("Настройки")', timeout=15000)
    page.screenshot(path="jules-scratch/verification/06_settings.png")
    print("Screenshot of Settings taken.")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        take_screenshots(page)
        browser.close()

if __name__ == "__main__":
    main()
