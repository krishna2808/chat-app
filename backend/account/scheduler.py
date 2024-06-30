from apscheduler.schedulers.background import BackgroundScheduler
# from django.apps import apps

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(my_cron_job_function, 'cron', minute='*/1')  # Adjust the cron schedule as needed
    scheduler.start()

def my_cron_job_function():
    print("function call my_cron_job --------------------  ")

# Start the scheduler when Django starts
def start_django_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(my_cron_job_function, 'interval', seconds=10)  # Start the scheduler every 10 seconds
    # scheduler.start()