"""Create/activate Play subscription base plans via Android Publisher API."""
from __future__ import annotations

import json
import sys

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

PKG = "com.abdullahbekir.DailyscheduleApp"
SA = "secrets/google-play-service-account.json"
SCOPES = ["https://www.googleapis.com/auth/androidpublisher"]


def client():
    creds = service_account.Credentials.from_service_account_file(SA, scopes=SCOPES)
    return build("androidpublisher", "v3", credentials=creds, cache_discovery=False)


def money_try(amount: float) -> dict:
    units = int(amount)
    nanos = int(round((amount - units) * 1_000_000_000))
    return {"currencyCode": "TRY", "units": str(units), "nanos": nanos}


def convert_prices(svc, amount_try: float) -> list[dict]:
    converted = (
        svc.monetization()
        .convertRegionPrices(
            packageName=PKG,
            body={"price": money_try(amount_try)},
        )
        .execute()
    )
    regional = []
    # Response shape: convertedRegionPrices map regionCode -> {price, ...}
    mapping = converted.get("convertedRegionPrices") or {}
    for region_code, info in mapping.items():
        price = info.get("price") if isinstance(info, dict) else None
        if not price:
            continue
        regional.append(
            {
                "regionCode": region_code,
                "newSubscriberAvailability": True,
                "price": price,
            }
        )
    # Ensure TR is present with exact amount
    if not any(r["regionCode"] == "TR" for r in regional):
        regional.append(
            {
                "regionCode": "TR",
                "newSubscriberAvailability": True,
                "price": money_try(amount_try),
            }
        )
    return regional


def clear_restrictions_and_upsert(
    svc,
    product_id: str,
    base_plan_id: str,
    period: str,
    amount_try: float,
    listing_title: str,
    listing_desc: str,
):
    regional = convert_prices(svc, amount_try)
    print(f"{product_id}: regional prices = {len(regional)}")

    body = {
        "packageName": PKG,
        "productId": product_id,
        "listings": [
            {
                "title": listing_title,
                "languageCode": "tr-TR",
                "description": listing_desc,
                "benefits": [
                    "Reklamları kaldır",
                    "Premium özelliklere erişim",
                    "Kesintisiz kullanım",
                ],
            }
        ],
        "taxAndComplianceSettings": {
            "eeaWithdrawalRightType": "WITHDRAWAL_RIGHT_SERVICE",
            "regionalProductAgeRatingInfos": [
                {
                    "regionCode": "US",
                    "productAgeRatingTier": "PRODUCT_AGE_RATING_TIER_EIGHTEEN_AND_ABOVE",
                }
            ],
        },
        # Empty = no payment-country restrictions
        "restrictedPaymentCountries": {"regionCodes": []},
        "basePlans": [
            {
                "basePlanId": base_plan_id,
                "autoRenewingBasePlanType": {
                    "billingPeriodDuration": period,
                    "gracePeriodDuration": "P3D",
                    "accountHoldDuration": "P30D",
                    "resubscribeState": "RESUBSCRIBE_STATE_ACTIVE",
                    "prorationMode": "SUBSCRIPTION_PRORATION_MODE_CHARGE_ON_NEXT_BILLING_DATE",
                },
                "regionalConfigs": regional,
                "otherRegionsConfig": {
                    "usdPrice": next(
                        (r["price"] for r in regional if r["regionCode"] == "US"),
                        {"currencyCode": "USD", "units": "1", "nanos": 490000000},
                    ),
                    "newSubscriberAvailability": True,
                },
            }
        ],
    }

    # Create or patch subscription
    try:
        existing = (
            svc.monetization()
            .subscriptions()
            .get(packageName=PKG, productId=product_id)
            .execute()
        )
        print(f"{product_id}: exists, patching…")
        # Keep existing listings if present
        if existing.get("listings"):
            body["listings"] = existing["listings"]
            # Ensure benefits
            for listing in body["listings"]:
                listing.setdefault(
                    "benefits",
                    [
                        "Reklamları kaldır",
                        "Premium özelliklere erişim",
                        "Kesintisiz kullanım",
                    ],
                )
        updated = (
            svc.monetization()
            .subscriptions()
            .patch(
                packageName=PKG,
                productId=product_id,
                updateMask=(
                    "listings,taxAndComplianceSettings,restrictedPaymentCountries,basePlans"
                ),
                regionsVersion_version="2025/01",
                body=body,
            )
            .execute()
        )
    except HttpError as e:
        if e.resp.status != 404:
            raise
        print(f"{product_id}: creating…")
        updated = (
            svc.monetization()
            .subscriptions()
            .create(
                packageName=PKG,
                productId=product_id,
                regionsVersion_version="2025/01",
                body=body,
            )
            .execute()
        )

    print(
        f"{product_id}: basePlans={[ (bp.get('basePlanId'), bp.get('state')) for bp in updated.get('basePlans') or [] ]}"
    )

    # Activate base plan
    try:
        act = (
            svc.monetization()
            .subscriptions()
            .basePlans()
            .activate(
                packageName=PKG,
                productId=product_id,
                basePlanId=base_plan_id,
            )
            .execute()
        )
        print(f"{product_id}/{base_plan_id}: activated state={act.get('state')}")
    except HttpError as e:
        print(f"{product_id}/{base_plan_id}: activate warning: {e}")

    return updated


def main():
    svc = client()
    clear_restrictions_and_upsert(
        svc,
        product_id="planly_premium_monthly",
        base_plan_id="monthly",
        period="P1M",
        amount_try=49.99,
        listing_title="Planly Premium Monthly",
        listing_desc="Planly Pro aylık abonelik",
    )
    clear_restrictions_and_upsert(
        svc,
        product_id="planly_premium_annual",
        base_plan_id="annual",
        period="P1Y",
        amount_try=499.99,
        listing_title="Planly Premium Annual",
        listing_desc="Planly Pro yıllık abonelik",
    )

    listed = svc.monetization().subscriptions().list(packageName=PKG).execute()
    for s in listed.get("subscriptions") or []:
        print(
            "FINAL",
            s.get("productId"),
            [(bp.get("basePlanId"), bp.get("state")) for bp in s.get("basePlans") or []],
            "restricted",
            len((s.get("restrictedPaymentCountries") or {}).get("regionCodes") or []),
        )


if __name__ == "__main__":
    try:
        main()
    except HttpError as e:
        print("HTTP_ERROR", e.resp.status, e.content.decode("utf-8", errors="replace")[:3000])
        sys.exit(1)
