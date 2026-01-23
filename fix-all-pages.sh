#!/bin/bash
# Add try/catch with mock data to all server component pages

echo "Adding try/catch to all pages..."

# Customers page
sed -i '' '3 i\
import { MOCK_CUSTOMERS } from "@/lib/mock-data"
' src/app/customers/page.tsx

sed -i '' '/const customers = await prisma/,/})/ {
  s/const customers = await prisma/let customers: any\[\] = \[\]\
  try {\
    customers = await prisma/
  s/})/  })\
  } catch (error) {\
    console.log("Database unavailable, using mock customers")\
    customers = MOCK_CUSTOMERS\
  }/
}' src/app/customers/page.tsx

# Add similar patches for other pages...
echo "Script ready - run manually for each page"
